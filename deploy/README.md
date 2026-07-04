# Деплой — единый сервис (бот + API + мини-апп)

Один Docker-контейнер делает всё:
- **FastAPI** отдаёт API (`/api/...`) и статичный мини-апп (`/`) с одного HTTPS-адреса;
- **бот** работает в режиме **polling** (публичный URL для бота не нужен);
- **SQLite** лежит на постоянном томе (`/app/data`).

Нужен **всего один публичный HTTPS-адрес** — под кнопку мини-аппа в BotFather.

---

## Переменные окружения (задаются в панели хостинга, НЕ в git)

| Переменная | Значение |
|---|---|
| `BOT_TOKEN` | токен из @BotFather |
| `MINIAPP_URL` | публичный HTTPS-адрес этого сервиса (напр. `https://xxx.bothost.ru`) |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/calorie_bot.db` |
| `RUN_BOT` | `true` |
| `STATIC_DIR` | `static` |
| `CORS_ORIGINS` | `*` (или адрес мини-аппа) |

> Мини-апп ходит на API того же origin, поэтому отдельный `VITE_API_URL` не нужен.

---

## Вариант A — bothost.ru (Docker + Git)

1. В панели bothost создай проект из этого репозитория (деплой по Git) — он подхватит корневой `Dockerfile`.
2. Пропиши переменные окружения (таблица выше). `MINIAPP_URL` временно оставь пустым.
3. Смонтируй **постоянный том (Volume)** в `/app/data` — чтобы БД не терялась при перезапуске.
4. После первого деплоя найди в панели **публичный адрес** сервиса.
   - Если адрес ЕСТЬ → впиши его в `MINIAPP_URL` и передеплой.
   - Если публичного адреса НЕТ (bothost отдаёт только webhook) → мини-апп вынеси на Cloudflare Pages (Вариант B), а тут оставь только бот+API.
5. Проверь `https://<адрес>/health` → должно вернуть `{"status":"ok"}`.

## Вариант B — запасной (если у bothost нет публичного веб-адреса)

- **Мини-апп** → Cloudflare Pages: билд-команда `npm run build`, каталог `miniapp`, output `dist`. Получишь `https://<проект>.pages.dev`.
  - Задай `VITE_API_URL` = публичный адрес API при сборке.
- **Бот + API** → любой хост с публичным HTTPS (Render/Railway) тем же `Dockerfile`.

---

## Настройка бота в @BotFather

1. `/setmenubutton` (или Bot Settings → Menu Button) → указать `MINIAPP_URL`.
2. (Опционально) `/newapp` — создать Mini App с тем же URL.
3. Проверь: открой бота → `/start` → кнопка «Открыть счётчик».

---

## Локальный прогон в Docker (проверка перед деплоем)

```bash
cd calorie-bot
docker build -t calorie-bot .
docker run -p 8000:8000 --env-file backend/.env -v $(pwd)/data:/app/data calorie-bot
# → http://localhost:8000  (мини-апп)
# → http://localhost:8000/health
```
