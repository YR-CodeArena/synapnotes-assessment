"""Application configuration loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

# Root .env first, then backend/.env so either location works regardless of cwd.
load_dotenv(ROOT_DIR / ".env", encoding="utf-8")
load_dotenv(BACKEND_DIR / ".env", encoding="utf-8")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
        env_file=(str(ROOT_DIR / ".env"), str(BACKEND_DIR / ".env")),
        env_file_encoding="utf-8",
    )

    database_url: str = ""
    secret_key: str = "synapnotes-dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 720
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    groq_api_key: str = ""
    frontend_origin: str = "http://localhost:5173"
    app_name: str = "SynapNotes Core"
    app_version: str = "1.0.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
