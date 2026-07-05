"""Валидация Telegram Mini App initData (защита API мини-аппа).

Используем встроенный валидатор aiogram — он корректно считает HMAC-подпись
токеном бота и разбирает поле user.
"""
import logging

from aiogram.utils.web_app import check_webapp_signature, parse_webapp_init_data

from app.core.config import settings

log = logging.getLogger("auth")


def validate_init_data(init_data: str) -> dict | None:
    """Проверяет подпись initData и возвращает данные пользователя (dict) либо None."""
    if not init_data:
        log.warning("AUTH: пустой initData")
        return None
    try:
        if not check_webapp_signature(settings.bot_token, init_data):
            log.warning("AUTH: подпись initData неверна")
            return None
        data = parse_webapp_init_data(init_data)
    except Exception as e:  # noqa: BLE001
        log.warning("AUTH: ошибка разбора initData: %s", e)
        return None

    if not data.user:
        log.warning("AUTH: в initData нет user")
        return None

    return {
        "id": data.user.id,
        "first_name": data.user.first_name,
        "last_name": data.user.last_name,
        "username": data.user.username,
    }
