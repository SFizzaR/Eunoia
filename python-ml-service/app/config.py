from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application configuration from environment variables"""
    
    # Model configuration
    MODEL_NAME: str = "j-hartmann/emotion-english-distilroberta-base"
    HF_TOKEN: Optional[str] = None
    
    # API configuration
    API_TITLE: str = "Eunoia Mood Analyzer"
    API_VERSION: str = "1.0.0"
    
    # Server configuration
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # CORS configuration
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://*.onrender.com",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()