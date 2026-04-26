"""
CRUD operations for the detections table.
"""
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import DetectionRecord
from typing import List, Dict


async def save_detection(db: AsyncSession, result: Dict, prompt: str) -> DetectionRecord:
    """Persist a detection result to the database."""
    record = DetectionRecord(
        prompt=prompt,
        risk_score=result["risk_score"],
        status=result["status"],
        drift_score=result["drift_score"],
        behavior_score=result["behavior_score"],
        explanation=result["explanation"],
        patterns_matched=json.dumps(result.get("patterns_matched", [])),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def get_history(db: AsyncSession, limit: int = 50) -> List[DetectionRecord]:
    """Fetch the most recent detection records."""
    result = await db.execute(
        select(DetectionRecord).order_by(desc(DetectionRecord.timestamp)).limit(limit)
    )
    return result.scalars().all()
