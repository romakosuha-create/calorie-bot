"""Зависимости FastAPI: определение текущего пользователя по Telegram initData."""
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import validate_init_data
from app.db.base import get_db
from app.models import User


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Ожидает заголовок `Authorization: tma <initData>`.
    Проверяет подпись, находит/создаёт пользователя.
    """
    if not authorization or not authorization.startswith("tma "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Нет initData")

    init_data = authorization[4:]
    tg_user = validate_init_data(init_data)
    if not tg_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверная подпись initData")

    tg_id = int(tg_user["id"])
    user = (await db.execute(select(User).where(User.tg_id == tg_id))).scalar_one_or_none()
    if user is None:
        user = User(
            tg_id=tg_id,
            name=" ".join(filter(None, [tg_user.get("first_name"), tg_user.get("last_name")])) or None,
            username=tg_user.get("username"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
