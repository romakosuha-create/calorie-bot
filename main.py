"""Точка входа для авто-сборки bothost.

Наш код лежит в подпапке backend/. Этот файл в корне репозитория нужен,
чтобы платформа (которая ищет main.py в корне) корректно запустила единый
сервис: FastAPI (API + статичный мини-апп) + бот (polling).

Пути к статике и БД внутри приложения абсолютные, поэтому рабочая директория
не важна. Работает и как `python main.py`, и как `uvicorn main:app`.
"""
import os
import sys

BACKEND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, BACKEND)  # чтобы пакет `app` импортировался

from app.main import app  # noqa: E402  экспортируем app для `uvicorn main:app`

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
