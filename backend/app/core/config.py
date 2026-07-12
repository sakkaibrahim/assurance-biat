from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Insurance AI Copilot"
    database_url: str = "sqlite:///./insurance_ai.db"
    redis_url: str = "redis://localhost:6379/0"
    qdrant_url: str = "http://localhost:6333"
    environment: str = "local"

    # Ollama (local LLM runtime)
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # Email / SMTP (alert notifications). Left empty -> mock mode (saved to disk).
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_tls: bool = True
    alert_from_email: str = "copilot@biat-assurance.tn"
    alert_to_email: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

