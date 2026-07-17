# Самотест API: подписанный initData -> все эндпоинты. Запуск: python _selftest.py
import asyncio, hashlib, hmac, json, os, sys, urllib.parse

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./data/_selftest.db"
os.environ["RUN_BOT"] = "false"
sys.path.insert(0, ".")
for f in ("data/_selftest.db",):
    if os.path.exists(f):
        os.remove(f)

from app.core.config import settings
from app.main import app
from app.db.base import init_models

def make_init_data(token: str, tg_id: int = 777000111) -> str:
    user = json.dumps({"id": tg_id, "first_name": "Тест", "username": "selftest"})
    pairs = {"auth_date": "1751600000", "query_id": "AAF_test", "user": user}
    dcs = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    h = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()
    return urllib.parse.urlencode({**pairs, "hash": h})

async def main():
    import httpx
    await init_models()
    hdr = {"Authorization": f"tma {make_init_data(settings.bot_token)}"}
    ok, fail = 0, []
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t") as c:
        async def check(name, resp, want=200):
            nonlocal ok
            if resp.status_code == want:
                ok += 1
            else:
                fail.append(f"{name}: {resp.status_code} {resp.text[:200]}")

        await check("health", await c.get("/health"))
        await check("me (авторизация)", await c.get("/api/me", headers=hdr))
        await check("onboarding", await c.post("/api/onboarding", headers=hdr, json={
            "gender": "male", "birth_year": 1998, "height_cm": 178, "weight_kg": 78,
            "activity": "moderate", "goal": "maintain"}))
        r = await c.get("/api/me", headers=hdr)
        await check("me.onboarded==True", r, 200)
        if r.status_code == 200 and not r.json()["onboarded"]:
            fail.append("onboarded не сохранился!")
        d = "2026-07-05"
        await check("meal поиск-стиль (grams=250)", await c.post("/api/meals", headers=hdr, json={
            "entry_date": d, "meal_type": "lunch", "name": "Гречка с курицей",
            "grams": 250, "kcal": 340, "protein": 30, "fat": 6, "carb": 45, "fiber": 5}), 201)
        await check("meal ручной (grams=0)", await c.post("/api/meals", headers=hdr, json={
            "entry_date": d, "meal_type": "breakfast", "name": "Протеиновый коктейль",
            "grams": 0, "kcal": 220, "protein": 35, "fat": 3, "carb": 12}), 201)
        await check("water", await c.post("/api/water", headers=hdr, json={"entry_date": d, "ml": 800}), 204)
        await check("workout", await c.post("/api/workouts", headers=hdr, json={
            "entry_date": d, "type": "Силовая", "duration_min": 60, "kcal_burned": 400}), 201)
        await check("weight", await c.post("/api/weight", headers=hdr, json={"entry_date": d, "weight_kg": 77.8}), 204)
        await check("weight history", await c.get("/api/weight", headers=hdr))
        await check("patch water goal", await c.patch("/api/me", headers=hdr, json={"water_goal_ml": 2500}))
        r = await c.get(f"/api/day/{d}", headers=hdr)
        await check("day summary", r)
        if r.status_code == 200:
            day = r.json()
            exp = [
                (len(day["meals"]) == 2, "в day 2 приёма"),
                (day["consumed"]["kcal"] == 560, f"kcal=560 (есть {day['consumed']['kcal']})"),
                (day["water_ml"] == 800, "water=800"),
                (day["water_goal_ml"] == 2500, "water_goal=2500"),
                (len(day["workouts"]) == 1, "1 тренировка"),
                (day["burned_kcal"] == 400, "burned=400"),
            ]
            for cond, name in exp:
                ok += 1 if cond else 0
                if not cond:
                    fail.append(f"day: {name}")
        r = await c.get("/api/foods/search?q=греч", headers=hdr)
        await check("search 'греч'", r)
        if r.status_code == 200 and not r.json():
            fail.append("search 'греч' пуст!")
        r = await c.get("/api/foods/search?q=яйцо", headers=hdr)
        if r.status_code == 200 and not r.json():
            fail.append("search 'яйцо' пуст!")
        else:
            ok += 1
        mid = (await c.get(f"/api/day/{d}", headers=hdr)).json()["meals"][0]["id"]
        await check("delete meal", await c.delete(f"/api/meals/{mid}", headers=hdr), 204)
        await check("без авторизации -> 401", await c.get("/api/me"), 401)

    print(f"OK: {ok}")
    for f_ in fail:
        print("FAIL:", f_)
    sys.exit(1 if fail else 0)

asyncio.run(main())
