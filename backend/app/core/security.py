"""Валидация Telegram Mini App initData (защита API мини-аппа).

Схема: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
Фронт присылает строку initData → проверяем HMAC-подпись токеном бота →
доверяем полю user (tg_id, имя, username).
"""
import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from app.core.config import settings


def validate_init_data(init_data: str) -> dict | None:
    """Проверяет подпись и возвращает данные пользователя (dict) либо None."""
    try:
        parsed = dict(parse_qsl(init_data, strict_parsing=True))
    except ValueError:
        return None

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return None

    # Строка для проверки: пары key=value, отсортированные, через \n
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))

    secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
    calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calc_hash, received_hash):
        return None

    user_raw = parsed.get("user")
    if not user_raw:
        return None
    try:
        return json.loads(user_raw)
    except json.JSONDecodeError:
        return None
