"""Расчёт нормы калорий и макросов (Миффлин–Сан Жеор)."""
from datetime import date

from app.models import ActivityLevel, Gender, Goal

ACTIVITY_FACTOR = {
    ActivityLevel.sedentary: 1.2,
    ActivityLevel.light: 1.375,
    ActivityLevel.moderate: 1.55,
    ActivityLevel.active: 1.725,
    ActivityLevel.very_active: 1.9,
}

GOAL_FACTOR = {
    Goal.lose: 0.82,      # −18%
    Goal.maintain: 1.0,
    Goal.gain: 1.12,      # +12%
}

# Распределение макросов (доля от калорий): белок / жир / углеводы
MACRO_SPLIT = {"protein": 0.30, "fat": 0.30, "carb": 0.40}
KCAL_PER_G = {"protein": 4, "fat": 9, "carb": 4}


def calc_bmr(gender: Gender, weight_kg: float, height_cm: float, age: int) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + 5 if gender == Gender.male else base - 161


def calc_targets(
    gender: Gender,
    weight_kg: float,
    height_cm: float,
    birth_year: int,
    activity: ActivityLevel,
    goal: Goal,
) -> dict[str, int]:
    """Возвращает целевые калории и макросы (граммы)."""
    age = date.today().year - birth_year
    bmr = calc_bmr(gender, weight_kg, height_cm, age)
    tdee = bmr * ACTIVITY_FACTOR[activity]
    calories = round(tdee * GOAL_FACTOR[goal])

    return {
        "calorie_target": calories,
        "protein_target": round(calories * MACRO_SPLIT["protein"] / KCAL_PER_G["protein"]),
        "fat_target": round(calories * MACRO_SPLIT["fat"] / KCAL_PER_G["fat"]),
        "carb_target": round(calories * MACRO_SPLIT["carb"] / KCAL_PER_G["carb"]),
    }
