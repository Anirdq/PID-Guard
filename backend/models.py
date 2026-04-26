from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class DetectionRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000, description="The prompt to analyze for injection risk")


class DetectionResponse(BaseModel):
    id: Optional[int] = None
    prompt: str
    risk_score: float = Field(..., ge=0, le=100, description="Risk score from 0 (safe) to 100 (injection)")
    status: str = Field(..., description="One of: Safe, Suspicious, Injection")
    drift_score: float = Field(..., description="Semantic intent drift score (0-100)")
    behavior_score: float = Field(..., description="Behavioral pattern match score (0-100)")
    explanation: str = Field(..., description="Human-readable explanation of the result")
    patterns_matched: List[str] = Field(default_factory=list, description="List of matched attack pattern categories")
    timestamp: Optional[datetime] = None


class HistoryItem(BaseModel):
    id: int
    prompt: str
    risk_score: float
    status: str
    drift_score: float
    behavior_score: float
    explanation: str
    patterns_matched: List[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
