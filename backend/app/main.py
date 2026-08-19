"""SynapNotes AI FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.models import ActionItem, Meeting, User  # noqa: F401
from app.routers import actions, analytics, auth, meetings
from app.seed_data import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


settings = get_settings()
app = FastAPI(
    title="SynapNotes AI",
    description="AI-Powered Meeting Notes & Action Tracker",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(actions.router)
app.include_router(analytics.router)


@app.get("/health")
def health() -> dict[str, str]:
    current = get_settings()
    if (current.gemini_api_key or "").strip():
        engine = "gemini"
    elif (current.groq_api_key or "").strip():
        engine = "groq"
    else:
        engine = "mock"
    return {
        "status": "online",
        "system": "SynapNotes Core",
        "version": "1.0.0",
        "ai_engine": engine,
    }
