"""Настройки приложения (читаются из .env)."""
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Корень бэкенда (.../backend) — для абсолютных путей независимо от рабочей директории
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Telegram
    bot_token: str = ""
    miniapp_url: str = "https://example.com"
    # bothost автоматически задаёт WEBHOOK_URL вида https://<домен>/webhook —
    # используем его, чтобы определить публичный адрес мини-аппа без ручной настройки.
    webhook_url: str = ""

    @property
    def effective_miniapp_url(self) -> str:
        """Реальный адрес мини-аппа.

        На bothost переменная WEBHOOK_URL (https://<домен>/webhook) всегда отражает
        актуальный домен контейнера. Читаем её НАПРЯМУЮ из окружения (надёжнее, чем
        через pydantic-поле) и берём в приоритет — иначе устаревший MINIAPP_URL,
        «вшитый» при создании бота, ломает кнопку.
        """
        wh = os.environ.get("WEBHOOK_URL") or self.webhook_url
        if wh:
            base = wh.rstrip("/")
            if base.endswith("/webhook"):
                base = base[: -len("/webhook")]
            return base.rstrip("/")
        if self.miniapp_url and "example.com" not in self.miniapp_url:
            return self.miniapp_url.rstrip("/")
        return self.miniapp_url

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
