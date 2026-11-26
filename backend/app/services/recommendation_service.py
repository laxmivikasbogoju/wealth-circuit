import io
from datetime import datetime
from typing import List, Tuple

import pandas as pd
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation

CALL_TYPES = {"BUY", "SELL"}
CATEGORIES = {"SHORT_TERM", "POSITIONAL", "INTRADAY"}
STATUSES = {"ACTIVE", "TARGET_HIT", "SL_HIT"}

# Maps normalized (lowercased, non-alnum stripped) header names -> canonical field name
COLUMN_ALIASES = {
    "symbol": "symbol",
    "stock": "symbol",
    "script": "symbol",
    "stockscript": "symbol",
    "exchange": "exchange",
    "calltype": "call_type",
    "type": "call_type",
    "entrylow": "entry_low",
    "entrymin": "entry_low",
    "entryfrom": "entry_low",
    "entryhigh": "entry_high",
    "entrymax": "entry_high",
    "entryto": "entry_high",
    "target1": "target1",
    "targetone": "target1",
    "target2": "target2",
    "targettwo": "target2",
    "stoploss": "stop_loss",
    "sl": "stop_loss",
    "category": "category",
    "callcategory": "category",
    "segment": "category",
    "status": "status",
    "date": "call_date",
    "datetime": "call_date",
    "calldate": "call_date",
}


def _normalize_header(header: str) -> str:
    return "".join(ch for ch in str(header).lower() if ch.isalnum())


class RecommendationService:

    @staticmethod
    def parse_excel(file_bytes: bytes) -> Tuple[List[Recommendation], List[str]]:
        """Parse an uploaded Excel file into Recommendation rows.

        Returns (rows, skipped_reasons). Row numbers in skipped_reasons are
        1-indexed and account for the header row (matches what a user sees
        when opening the sheet in Excel).
        """
        df = pd.read_excel(io.BytesIO(file_bytes))
        df.columns = [_normalize_header(c) for c in df.columns]

        rows: List[Recommendation] = []
        skipped: List[str] = []

        for idx, raw_row in df.iterrows():
            excel_row_num = idx + 2  # header is row 1
            row = {}
            for col, canonical in COLUMN_ALIASES.items():
                if col in df.columns and canonical not in row:
                    value = raw_row.get(col)
                    if pd.notna(value):
                        row[canonical] = value

            try:
                symbol = str(row["symbol"]).strip().upper()
                call_type = str(row["call_type"]).strip().upper()
                if call_type not in CALL_TYPES:
                    raise ValueError(f"call_type must be BUY or SELL, got '{call_type}'")

                category = str(row.get("category", "POSITIONAL")).strip().upper().replace(" ", "_")
                if category not in CATEGORIES:
                    raise ValueError(f"category must be one of {CATEGORIES}, got '{category}'")

                status = str(row.get("status", "ACTIVE")).strip().upper().replace(" ", "_")
                if status not in STATUSES:
                    raise ValueError(f"status must be one of {STATUSES}, got '{status}'")

                entry_low = float(row["entry_low"])
                entry_high = float(row["entry_high"])
                target1 = float(row["target1"])
                target2 = float(row["target2"])
                stop_loss = float(row["stop_loss"])

                call_date_val = row.get("call_date")
                if call_date_val is not None:
                    call_date = pd.to_datetime(call_date_val).to_pydatetime()
                else:
                    call_date = datetime.utcnow()

                exchange = str(row.get("exchange", "NSE")).strip().upper() or "NSE"

                rows.append(Recommendation(
                    symbol=symbol,
                    exchange=exchange,
                    call_type=call_type,
                    entry_low=entry_low,
                    entry_high=entry_high,
                    target1=target1,
                    target2=target2,
                    stop_loss=stop_loss,
                    category=category,
                    status=status,
                    call_date=call_date,
                ))
            except (KeyError, ValueError, TypeError) as e:
                skipped.append(f"Row {excel_row_num}: {e}")

        return rows, skipped

    @staticmethod
    def store(db: Session, rows: List[Recommendation]) -> int:
        db.add_all(rows)
        db.commit()
        return len(rows)

    @staticmethod
    def list_all(db: Session) -> List[Recommendation]:
        return db.query(Recommendation).order_by(Recommendation.call_date.desc()).all()

    @staticmethod
    def compute_stats(recommendations: List[Recommendation]) -> dict:
        total = len(recommendations)
        active = sum(1 for r in recommendations if r.status == "ACTIVE")
        closed = [r for r in recommendations if r.status in ("TARGET_HIT", "SL_HIT")]

        hit_rate = 0.0
        avg_return = 0.0
        if closed:
            hits = sum(1 for r in closed if r.status == "TARGET_HIT")
            hit_rate = round((hits / len(closed)) * 100, 1)

            returns = []
            for r in closed:
                entry_mid = (r.entry_low + r.entry_high) / 2
                if entry_mid == 0:
                    continue
                if r.call_type == "BUY":
                    pct = (r.target1 - entry_mid) / entry_mid * 100 if r.status == "TARGET_HIT" \
                        else (r.stop_loss - entry_mid) / entry_mid * 100
                else:
                    pct = (entry_mid - r.target1) / entry_mid * 100 if r.status == "TARGET_HIT" \
                        else (entry_mid - r.stop_loss) / entry_mid * 100
                returns.append(pct)
            if returns:
                avg_return = round(sum(returns) / len(returns), 1)

        return {
            "total": total,
            "active": active,
            "hit_rate": hit_rate,
            "avg_return": avg_return,
        }
