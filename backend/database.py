"""
PID-Guard Database — SQLite via SQLAlchemy (async)
Zero-config: database file created automatically at startup.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, JSON, func
from datetime import datetime

# Default to local SQLite file (student-friendly, no server needed)
DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite+aiosqlite:///./pid_guard.db"
)


class Base(DeclarativeBase):
    pass


class DetectionRecord(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    prompt: Mapped[str] = mapped_column(String(5000))
    risk_score: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20))
    drift_score: Mapped[float] = mapped_column(Float, default=0.0)
    behavior_score: Mapped[float] = mapped_column(Float, default=0.0)
    explanation: Mapped[str] = mapped_column(String(2000), default="")
    patterns_matched: Mapped[str] = mapped_column(String(1000), default="[]")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now())


# Engine and session factory
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Create tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """FastAPI dependency: yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
