from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.schemas.recommendation import RecommendationListResponse, UploadResult
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

ALLOWED_CONTENT_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
}


@router.get("", response_model=RecommendationListResponse)
async def list_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all stock recommendations with summary stats"""
    recommendations = RecommendationService.list_all(db)
    stats = RecommendationService.compute_stats(recommendations)
    return {"stats": stats, "recommendations": recommendations}


@router.post("/upload", response_model=UploadResult)
async def upload_recommendations(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin-only: upload an Excel sheet of stock recommendations"""
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="File must be an Excel (.xlsx/.xls) file")

    contents = await file.read()
    try:
        rows, skipped = RecommendationService.parse_excel(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read Excel file: {e}")

    if not rows and skipped:
        raise HTTPException(status_code=400, detail="No valid rows found: " + "; ".join(skipped[:5]))

    inserted = RecommendationService.store(db, rows)
    return {"inserted": inserted, "skipped_rows": skipped}
