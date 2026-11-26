from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    exchange = Column(String, nullable=False, default="NSE")
    call_type = Column(String, nullable=False)  # BUY / SELL
    entry_low = Column(Float, nullable=False)
    entry_high = Column(Float, nullable=False)
    target1 = Column(Float, nullable=False)
    target2 = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    category = Column(String, nullable=False, default="POSITIONAL")  # SHORT_TERM / POSITIONAL / INTRADAY
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE / TARGET_HIT / SL_HIT
    call_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
