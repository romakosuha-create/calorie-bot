"""Настройки приложения (читаются из .env)."""
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Корень бэкенда (.../backend) — для абсолютных путей независимо от рабочей директории
BACKEND_ROOT = Path(__file__).resolve().parents[2]

# Публичный HTTPS-адрес сервиса (домен bothost). bothost НЕ пробрасывает WEBHOOK_URL
# в процесс, а MINIAPP_URL в окружении может устареть, поэтому держим актуальный домен
# здесь. Переопределяется переменной окружения PUBLIC_URL, если задана.
DEFAULT_PUBLIC_URL = "https://bot-1783192606-7565-romakosuha.bothost.tech"


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
        """Публичный адрес мини-аппа для кнопок бота.

        Берём PUBLIC_URL из окружения, иначе — зашитый актуальный домен.
        Так устаревший MINIAPP_URL, «вшитый» bothost при создании бота, не ломает кнопку.
        """
        return (os.environ.get("PUBLIC_URL") or DEFAULT_PUBLIC_URL).rstrip("/")

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
