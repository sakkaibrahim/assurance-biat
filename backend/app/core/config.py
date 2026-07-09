from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Insurance AI Copilot"
    database_url: str = "sqlite:///./insurance_ai.db"
    redis_url: str = "redis://localhost:6379/0"
    qdrant_url: str = "http://localhost:6333"
    environment: str = "local"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

