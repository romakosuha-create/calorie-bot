"""Настройки приложения (читаются из .env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Telegram
    bot_token: str = ""
    miniapp_url: str = "https://example.com"

    # БД
    database_url: str = "sqlite+aiosqlite:///./calorie_bot.db"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "*"

    # Единый сервис: запускать ли бота внутри процесса API + где статика мини-аппа
    run_bot: bool = True
    static_dir: str = "static"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
