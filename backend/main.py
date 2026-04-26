"""
PID-Guard — FastAPI Backend
Main entry point. Provides /detect, /history, and /health endpoints.
"""

import sys
import os
import json
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Security, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Make model/ directory importable
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "model"))
sys.path.insert(0, MODEL_DIR)

from models import DetectionRequest, DetectionResponse, HealthResponse
from database import init_db, get_db
from crud import save_detection, get_history

# Initialize detector once (lazy-loads ML model on first use)
from detector import PromptInjectionDetector

# Global detector reference — refreshed on each uvicorn reload via lifespan
detector: PromptInjectionDetector = None


# ------------------------------------------------------------------ #
#  Security & Infrastructure                                           #
# ------------------------------------------------------------------ #
limiter = Limiter(key_func=get_remote_address)
API_KEY = os.getenv("PIDGUARD_API_KEY", "PidGuard-Demo-Key")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=401, detail="Invalid or missing X-API-Key header"
        )
    return api_key

# ------------------------------------------------------------------ #
#  App lifecycle                                                       #
# ------------------------------------------------------------------ #
@asynccontextmanager
async def lifespan(app: FastAPI):
    global detector
    # Startup: create DB tables
    await init_db()
    print("[PID-Guard] Database initialized.")
    # Create fresh detector (lazy-computes embeddings during 1st request)
    detector = PromptInjectionDetector()
    yield
    print("[PID-Guard] Shutting down.")
    print("[PID-Guard] Shutting down.")


# ------------------------------------------------------------------ #
#  App instance                                                        #
# ------------------------------------------------------------------ #
app = FastAPI(
    title="PID-Guard API",
    description="Prompt Injection Detection Platform — Enterprise Version",
    version="2.0.0",
    lifespan=lifespan,
)

# SlowAPI exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow the React dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
#  Routes                                                              #
# ------------------------------------------------------------------ #

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "PID-Guard API is running",
        "docs": "/docs",
        "endpoints": ["/detect", "/history", "/health"],
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    model_loaded = detector._model is not None and detector._model != "HEURISTIC"
    return HealthResponse(status="ok", version="2.0.0", model_loaded=model_loaded)


@app.post("/detect", response_model=DetectionResponse, tags=["Detection"])
@limiter.limit("20/minute")
async def detect_injection(
    request: Request,
    payload: DetectionRequest,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(get_api_key),
):
    """
    Analyze a prompt for injection risk. Requires API Key.
    Returns risk_score (0-100), status, and explanation.
    """
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    # Run detection
    try:
        result = detector.analyze(payload.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection engine error: {str(e)}")

    # Persist to database
    try:
        record = await save_detection(db, result, payload.prompt)
        record_id = record.id
        record_timestamp = record.timestamp
    except Exception as e:
        print(f"[PID-Guard] DB save error (non-fatal): {e}")
        record_id = None
        record_timestamp = datetime.utcnow()

    return DetectionResponse(
        id=record_id,
        prompt=payload.prompt,
        risk_score=result["risk_score"],
        status=result["status"],
        drift_score=result["drift_score"],
        behavior_score=result["behavior_score"],
        explanation=result["explanation"],
        patterns_matched=result["patterns_matched"],
        timestamp=record_timestamp,
    )


@app.get("/history", tags=["History"])
async def get_detection_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(get_api_key),
):
    """Retrieve the last N detection records. Requires API Key."""
    from datetime import timezone

    records = await get_history(db, limit=limit)
    history = []
    for r in records:
        try:
            patterns = json.loads(r.patterns_matched) if r.patterns_matched else []
        except Exception:
            patterns = []
        
        # Ensure timestamp is treated as strictly UTC so JS converts it to Local Time
        ts_iso = r.timestamp.replace(tzinfo=timezone.utc).isoformat() if r.timestamp else None

        history.append({
            "id": r.id,
            "prompt": r.prompt[:200],  # truncate for safety
            "risk_score": r.risk_score,
            "status": r.status,
            "drift_score": r.drift_score,
            "behavior_score": r.behavior_score,
            "explanation": r.explanation,
            "patterns_matched": patterns,
            "timestamp": ts_iso,
        })
    return {"detections": history, "total": len(history)}
