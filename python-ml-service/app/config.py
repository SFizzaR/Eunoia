from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    MODEL_NAME: str = "SamLowe/roberta-base-go_emotions"
    CONFIDENCE_THRESHOLD: float = 0.3
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Debug: print loaded settings
print(f"Settings loaded - MODEL_NAME: {settings.MODEL_NAME}")