from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecommendationResponse(BaseModel):
    id: int
    symbol: str
    exchange: str
    call_type: str
    entry_low: float
    entry_high: float
    target1: float
    target2: float
    stop_loss: float
    category: str
    status: str
    call_date: datetime

    class Config:
        from_attributes = True

class RecommendationStats(BaseModel):
    total: int
    active: int
    hit_rate: float
    avg_return: float

class RecommendationListResponse(BaseModel):
    stats: RecommendationStats
    recommendations: List[RecommendationResponse]

class UploadResult(BaseModel):
    inserted: int
    skipped_rows: List[str] = []
