# ===== Stage 1: сборка мини-аппа (React) =====
FROM node:20-alpine AS miniapp
WORKDIR /app
COPY miniapp/package*.json ./
RUN npm ci
COPY miniapp/ ./
RUN npm run build

# ===== Stage 2: бэкенд (бот + API + статика) =====
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
# Собранный мини-апп кладём в ./static — FastAPI раздаёт его с того же адреса
COPY --from=miniapp /app/dist ./static

# Каталог для SQLite (смонтируй сюда постоянный том на хостинге)
RUN mkdir -p data

EXPOSE 8000
# ${PORT} — если платформа задаёт свой порт (bothost/Render), иначе 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
