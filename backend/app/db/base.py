"""Подключение к БД и базовый класс моделей (SQLAlchemy 2.0 async)."""
import logging
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import BACKEND_ROOT, settings

log = logging.getLogger("db")


def _resolve_db_url(url: str) -> str:
    """Для SQLite: делаем путь абсолютным (относительно backend/) и создаём папку."""
    if url.startswith("sqlite") and ":///" in url:
        prefix, path = url.split(":///", 1)
        p = Path(path)
        if not p.is_absolute():
            p = (BACKEND_ROOT / path).resolve()
        p.parent.mkdir(parents=True, exist_ok=True)
        return f"{prefix}:///{p.as_posix()}"
    return url


engine = create_async_engine(_resolve_db_url(settings.database_url), echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI-зависимость: выдаёт сессию БД на время запроса."""
    async with AsyncSessionLocal() as session:
        yield session


def _add_missing_columns(sync_conn) -> None:
    """Лёгкая авто-миграция для SQLite: добавляет колонки, которых нет в таблицах.

    create_all не изменяет уже существующие таблицы, поэтому при добавлении полей
    в модели старая БД остаётся без новых колонок. Здесь мы это чиним.
    """
    insp = inspect(sync_conn)
    existing_tables = set(insp.get_table_names())
    for table in Base.metadata.sorted_tables:
        if table.name not in existing_tables:
            continue
        existing_cols = {c["name"] for c in insp.get_columns(table.name)}
        for col in table.columns:
            if col.name in existing_cols:
                continue
            coltype = col.type.compile(sync_conn.dialect)
            default_sql = ""
            if col.default is not None and not col.default.is_callable and col.default.arg is not None:
                val = col.default.arg
                default_sql = f" DEFAULT {val!r}" if isinstance(val, str) else f" DEFAULT {val}"
            sync_conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {col.name} {coltype}{default_sql}'))
            log.info("Миграция: добавлена колонка %s.%s", table.name, col.name)


async def init_models() -> None:
    """Создаёт таблицы и добавляет недостающие колонки (dev-миграция)."""
    from app import models  # noqa: F401  регистрируем модели

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_add_missing_columns)
