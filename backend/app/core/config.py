from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os

class Settings(BaseSettings):
    APP_NAME: str = "CareLens"
    ENV: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = False  # Set True to force mock extraction; auto-detects if Gemini key is absent

    # AI Model Keys & Configs
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
    LLM_TEMPERATURE: float = 0.0

    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY", None)
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3.5-lightning:free")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # Storage & Processing
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".jpg", ".jpeg", ".png"]

    # Regional Translation Settings (Bonus Feature)
    ENABLE_TELUGU: bool = True
    ENABLE_HINDI: bool = True
    ENABLE_TAMIL: bool = True

    # ABDM Interoperability
    ENABLE_ABDM_FHIR: bool = True
    MOCK_ABHA_PREFIX: str = "91"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
