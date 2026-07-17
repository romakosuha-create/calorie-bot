"""Поиск продуктов: локальная база частых продуктов + Open Food Facts.

Нутриенты — на 100 г.
"""
import httpx

from app.schemas import FoodOut

BASE = "https://world.openfoodfacts.org"
FIELDS = "code,product_name,brands,nutriments"
UA = {"User-Agent": "CalorieBot/0.1 (Telegram Mini App)"}
TIMEOUT = httpx.Timeout(6.0)

# Локальная база частых продуктов (на 100 г): name, kcal, protein, fat, carb, fiber
_L = [
    ("Куриная грудка отварная", 137, 29, 1.8, 0, 0),
    ("Куриное бедро", 185, 21, 11, 0, 0),
    ("Говядина отварная", 254, 25, 16, 0, 0),
    ("Свинина", 259, 16, 21, 0, 0),
    ("Индейка филе", 104, 22, 1.5, 0, 0),
    ("Лосось запечённый", 206, 22, 13, 0, 0),
    ("Тунец консервированный", 96, 21, 1, 0, 0),
    ("Треска", 78, 18, 0.7, 0, 0),
    ("Яйцо куриное", 157, 12.7, 11.5, 0.7, 0),
    ("Яичный белок", 52, 11, 0, 0.7, 0),
    ("Творог 5%", 121, 17, 5, 3, 0),
    ("Творог обезжиренный", 71, 18, 0.6, 1.8, 0),
    ("Молоко 2.5%", 52, 2.9, 2.5, 4.7, 0),
    ("Кефир 1%", 40, 3, 1, 4, 0),
    ("Йогурт натуральный", 60, 5, 3.2, 3.5, 0),
    ("Сыр твёрдый", 356, 25, 28, 0, 0),
    ("Гречка варёная", 92, 3.4, 0.6, 19, 2.7),
    ("Рис белый варёный", 116, 2.2, 0.5, 25, 0.4),
    ("Рис бурый варёный", 111, 2.6, 0.9, 23, 1.8),
    ("Овсянка на воде", 88, 3, 1.7, 15, 1.7),
    ("Овсянка на молоке", 102, 3.3, 4.1, 14, 1.5),
    ("Макароны варёные", 112, 3.5, 0.4, 23, 1.8),
    ("Картофель отварной", 82, 2, 0.4, 17, 1.4),
    ("Картофель жареный", 192, 2.8, 9.5, 23, 2),
    ("Хлеб белый", 265, 8, 3.2, 49, 2.5),
    ("Хлеб цельнозерновой", 229, 9, 3, 43, 6),
    ("Банан", 96, 1.5, 0.2, 21, 1.7),
    ("Яблоко", 52, 0.4, 0.4, 14, 2.4),
    ("Апельсин", 47, 0.9, 0.1, 12, 2.4),
    ("Груша", 57, 0.4, 0.1, 15, 3.1),
    ("Виноград", 69, 0.7, 0.2, 18, 0.9),
    ("Огурец", 15, 0.8, 0.1, 3.6, 0.5),
    ("Помидор", 20, 0.9, 0.2, 3.9, 1.2),
    ("Морковь", 41, 0.9, 0.2, 10, 2.8),
    ("Брокколи", 34, 2.8, 0.4, 7, 2.6),
    ("Авокадо", 160, 2, 15, 9, 7),
    ("Банановый протеин (скуп)", 380, 75, 5, 8, 2),
    ("Арахисовая паста", 588, 25, 50, 20, 6),
    ("Миндаль", 579, 21, 50, 22, 12),
    ("Грецкий орех", 654, 15, 65, 14, 7),
    ("Мёд", 304, 0.3, 0, 82, 0.2),
    ("Шоколад молочный", 535, 7.6, 30, 59, 3.4),
    ("Банан сушёный", 346, 3.9, 1.8, 80, 9.9),
    ("Гречневая каша с курицей", 130, 9, 3, 16, 1.5),
]
LOCAL_FOODS = [
    FoodOut(name=n, kcal_100=k, protein_100=p, fat_100=f, carb_100=c, fiber_100=fb, source="local")
    for (n, k, p, f, c, fb) in _L
]


def _local_matches(query: str) -> list[FoodOut]:
    q = query.lower()
    return [f for f in LOCAL_FOODS if q in f.name.lower()]


def _to_food(p: dict) -> FoodOut | None:
    n = p.get("nutriments") or {}
    kcal = n.get("energy-kcal_100g")
    name = (p.get("product_name") or "").strip()
    if kcal is None or not name:
        return None
    return FoodOut(
        name=name,
        brand=(p.get("brands") or "").split(",")[0].strip() or None,
        barcode=p.get("code"),
        kcal_100=round(float(kcal), 1),
        protein_100=round(float(n.get("proteins_100g") or 0), 1),
        fat_100=round(float(n.get("fat_100g") or 0), 1),
        carb_100=round(float(n.get("carbohydrates_100g") or 0), 1),
        fiber_100=round(float(n.get("fiber_100g") or 0), 1),
        source="off",
    )


async def _off_search(query: str, limit: int) -> list[FoodOut]:
    params = {
        "search_terms": query, "search_simple": 1, "action": "process",
        "json": 1, "page_size": limit, "fields": FIELDS,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=UA) as client:
        r = await client.get(f"{BASE}/cgi/search.pl", params=params)
    if r.status_code != 200:
        return []
    return [f for p in r.json().get("products", []) if (f := _to_food(p))]


async def search_foods(query: str, limit: int = 20) -> list[FoodOut]:
    """Локальная база (мгновенно, надёжно) + Open Food Facts (если доступен)."""
    results = _local_matches(query)
    try:
        results += await _off_search(query, limit)
    except Exception:  # noqa: BLE001  OFF недоступен/таймаут — не критично
        pass
    seen: set[str] = set()
    out: list[FoodOut] = []
    for f in results:
        key = f.name.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(f)
        if len(out) >= limit:
            break
    return out


async def lookup_barcode(barcode: str) -> FoodOut | None:
    url = f"{BASE}/api/v2/product/{barcode}.json?fields={FIELDS}"
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=UA) as client:
        r = await client.get(url)
    if r.status_code != 200:
        return None
    data = r.json()
    if data.get("status") != 1:
        return None
    return _to_food(data.get("product", {}))
