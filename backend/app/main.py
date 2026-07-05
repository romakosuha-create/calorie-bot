"""Единая точка входа: FastAPI (API + статика мини-аппа) + бот в фоне."""
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.bot.main import run_polling
from app.core.config import BACKEND_ROOT, settings
from app.db.base import init_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_models()  # dev: создаём таблицы. На проде можно перейти на Alembic.

    bot_task: asyncio.Task | None = None
    if settings.run_bot:
        bot_task = asyncio.create_task(run_polling())
        logging.info("Бот запущен в фоне (polling)")

    yield

    if bot_task:
        bot_task.cancel()


VERSION = "0.3.0"

app = FastAPI(title="Счётчик калорий", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    # miniapp_url и version помогают проверить деплой снаружи
    return {"status": "ok", "version": VERSION, "miniapp_url": settings.effective_miniapp_url}


# Статика мини-аппа (собранный React) — раздаётся с того же адреса, что и API.
# Путь резолвим абсолютно (относительно backend/), чтобы не зависеть от рабочей директории.
_static = Path(settings.static_dir)
if not _static.is_absolute():
    _static = BACKEND_ROOT / _static
if _static.is_dir():
    app.mount("/", StaticFiles(directory=str(_static), html=True), name="miniapp")
