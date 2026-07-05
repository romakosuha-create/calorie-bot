"""Telegram-бот (aiogram 3): /start + кнопка запуска мини-аппа.

Может работать:
  - как отдельный процесс:  python -m app.bot.main
  - внутри общего сервиса:   через run_polling() из FastAPI (единый деплой)

Напоминания (APScheduler) добавим в Фазе 5.
"""
import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    MenuButtonWebApp,
    WebAppInfo,
)

from app.core.config import settings

logging.basicConfig(level=logging.INFO)

dp = Dispatcher()


def miniapp_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🍎 Открыть счётчик", web_app=WebAppInfo(url=settings.effective_miniapp_url))]
        ]
    )


@dp.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        f"Привет, {message.from_user.first_name}! 👋\n\n"
        "Я помогу считать калории, вести дневник питания и тренировок.\n"
        "Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=miniapp_kb(),
    )


async def run_polling() -> None:
    """Запуск бота в режиме long-polling (публичный URL не требуется)."""
    if not settings.bot_token:
        logging.warning("BOT_TOKEN не задан — бот не запущен")
        return

    bot = Bot(token=settings.bot_token)
    logging.info("Mini App URL для кнопок: %s", settings.effective_miniapp_url)
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="Добавить", web_app=WebAppInfo(url=settings.effective_miniapp_url))
        )
    except Exception as e:  # noqa: BLE001
        logging.warning("Не удалось установить кнопку-меню: %s", e)

    await dp.start_polling(bot, handle_signals=False)


if __name__ == "__main__":
    asyncio.run(run_polling())
