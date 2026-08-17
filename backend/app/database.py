"""Database engine, session factory, and dependency injection."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


def _build_engine():
    settings = get_settings()
    raw_url = (settings.database_url or "").strip()
    sqlite_url = "sqlite:///./synapnotes.db"

    if not raw_url:
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

    url = _normalize_database_url(raw_url)
    try:
        connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")
        return engine
    except Exception:
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
