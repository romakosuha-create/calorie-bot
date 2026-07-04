import WebApp from "@twa-dev/sdk";

/** Инициализация Telegram Mini App: тема, разворот, готовность. */
export function initTelegram() {
  try {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor("#0b0b0d");
    WebApp.setBackgroundColor("#0b0b0d");
  } catch {
    /* вне Telegram (локальный preview) — молча пропускаем */
  }
}

/** Строка initData для авторизации на бэкенде. Пусто = локальный preview. */
export function getInitData(): string {
  try {
    return WebApp.initData ?? "";
  } catch {
    return "";
  }
}

/** true, если открыто вне Telegram → используем mock-данные. */
export const IS_PREVIEW = !getInitData();

export const tg = WebApp;
