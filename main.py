"""Точка входа для авто-сборки bothost.

Наш код лежит в подпапке backend/. Этот файл в корне репозитория нужен,
чтобы платформа (которая ищет main.py в корне) корректно запустила единый
сервис: FastAPI (API + статичный мини-апп) + бот (polling) — всё из backend/.

Работает и как `python main.py`, и как `uvicorn main:app`.
"""
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(BASE, "backend")

# Переходим в backend/, чтобы относительные пути (static/, data/) резолвились там
os.chdir(BACKEND)
sys.path.insert(0, BACKEND)
os.makedirs("data", exist_ok=True)  # каталог для SQLite

from app.main import app  # noqa: E402  экспортируем app для `uvicorn main:app`

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
