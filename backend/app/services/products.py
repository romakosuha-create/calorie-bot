"""Интеграция с Open Food Facts: поиск продуктов и распознавание штрихкодов.

Нутриенты приводятся к значениям на 100 г.
Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
"""
import httpx

from app.schemas import FoodOut

BASE = "https://world.openfoodfacts.org"
FIELDS = "code,product_name,brands,nutriments"
UA = {"User-Agent": "CalorieBot/0.1 (Telegram Mini App)"}
TIMEOUT = httpx.Timeout(8.0)


def _to_food(p: dict) -> FoodOut | None:
    """Преобразует продукт OFF → FoodOut. None, если нет калорийности."""
    n = p.get("nutriments") or {}
    kcal = n.get("energy-kcal_100g")
    if kcal is None:
        return None
    name = (p.get("product_name") or "").strip()
    if not name:
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


async def search_foods(query: str, limit: int = 20) -> list[FoodOut]:
    url = f"{BASE}/cgi/search.pl"
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": limit,
        "fields": FIELDS,
    }
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=UA) as client:
        r = await client.get(url, params=params)
    if r.status_code != 200:
        return []
    products = r.json().get("products", [])
    result = [f for p in products if (f := _to_food(p))]
    return result[:limit]
