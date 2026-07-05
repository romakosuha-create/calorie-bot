"""Pydantic-схемы запросов/ответов API."""
from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.models import ActivityLevel, Gender, Goal, MealType


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tg_id: int
    name: str | None
    onboarded: bool
    gender: Gender | None
    birth_year: int | None
    height_cm: float | None
    weight_kg: float | None
    activity: ActivityLevel | None
    goal: Goal | None
    calorie_target: int | None
    protein_target: int | None
    fat_target: int | None
    carb_target: int | None
    water_goal_ml: int = 1600


class SettingsPatch(BaseModel):
    """Частичное обновление целей/настроек пользователя."""
    calorie_target: int | None = Field(default=None, ge=0)
    protein_target: int | None = Field(default=None, ge=0)
    fat_target: int | None = Field(default=None, ge=0)
    carb_target: int | None = Field(default=None, ge=0)
    water_goal_ml: int | None = Field(default=None, ge=0)


class OnboardingIn(BaseModel):
    gender: Gender
    birth_year: int = Field(ge=1920, le=date.today().year - 5)
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float = Field(ge=30, le=400)
    activity: ActivityLevel
    goal: Goal


class FoodOut(BaseModel):
    """Продукт из Open Food Facts / базы (нутриенты на 100 г)."""
    name: str
    brand: str | None = None
    barcode: str | None = None
    kcal_100: float
    protein_100: float = 0
    fat_100: float = 0
    carb_100: float = 0
    fiber_100: float = 0
    source: str = "off"


class MealIn(BaseModel):
    entry_date: date
    meal_type: MealType = MealType.snack
    name: str
    grams: float = Field(gt=0, default=100)
    kcal: float = Field(ge=0)
    protein: float = Field(ge=0, default=0)
    fat: float = Field(ge=0, default=0)
    carb: float = Field(ge=0, default=0)
    fiber: float = Field(ge=0, default=0)
    method: str = "manual"


class MealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_date: date
    meal_type: MealType
    name: str
    grams: float
    kcal: float
    protein: float
    fat: float
    carb: float
    fiber: float


class MacroTotals(BaseModel):
    kcal: float = 0
    protein: float = 0
    fat: float = 0
    carb: float = 0
    fiber: float = 0


class WorkoutIn(BaseModel):
    entry_date: date
    type: str
    duration_min: int = Field(ge=0, default=0)
    kcal_burned: float = Field(ge=0, default=0)
    note: str | None = None


class WorkoutOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_date: date
    type: str
    duration_min: int
    kcal_burned: float
    note: str | None


class WaterSet(BaseModel):
    entry_date: date
    ml: int = Field(ge=0)


class WeightIn(BaseModel):
    entry_date: date
    weight_kg: float = Field(gt=0, le=500)


class WeightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entry_date: date
    weight_kg: float


class DaySummary(BaseModel):
    entry_date: date
    targets: MacroTotals
    consumed: MacroTotals
    burned_kcal: float = 0
    remaining_kcal: float = 0
    water_ml: int = 0
    water_goal_ml: int = 1600
    meals: list[MealOut] = []
    workouts: list[WorkoutOut] = []
