"""SQLAlchemy-модели БД."""
from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"


class Goal(str, enum.Enum):
    lose = "lose"      # похудеть
    maintain = "maintain"  # держать
    gain = "gain"      # набрать


class ActivityLevel(str, enum.Enum):
    sedentary = "sedentary"        # 1.2  — сидячий
    light = "light"                # 1.375 — лёгкая активность
    moderate = "moderate"          # 1.55  — умеренная
    active = "active"              # 1.725 — высокая
    very_active = "very_active"    # 1.9   — очень высокая


class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(128))
    username: Mapped[str | None] = mapped_column(String(64))
    tz: Mapped[str] = mapped_column(String(64), default="Europe/Moscow")

    # Анкета
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender))
    birth_year: Mapped[int | None] = mapped_column(Integer)
    height_cm: Mapped[float | None] = mapped_column(Float)
    weight_kg: Mapped[float | None] = mapped_column(Float)
    activity: Mapped[ActivityLevel | None] = mapped_column(Enum(ActivityLevel))
    goal: Mapped[Goal | None] = mapped_column(Enum(Goal))

    # Рассчитанные цели
    calorie_target: Mapped[int | None] = mapped_column(Integer)
    protein_target: Mapped[int | None] = mapped_column(Integer)
    fat_target: Mapped[int | None] = mapped_column(Integer)
    carb_target: Mapped[int | None] = mapped_column(Integer)

    onboarded: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    meals: Mapped[list[MealEntry]] = relationship(back_populates="user", cascade="all, delete-orphan")
    workouts: Mapped[list[Workout]] = relationship(back_populates="user", cascade="all, delete-orphan")
    weights: Mapped[list[WeightLog]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Food(Base):
    """Справочник продуктов (Open Food Facts / пользовательские). Нутриенты на 100 г."""
    __tablename__ = "foods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(256), index=True)
    brand: Mapped[str | None] = mapped_column(String(128))
    barcode: Mapped[str | None] = mapped_column(String(32), index=True)
    kcal_100: Mapped[float] = mapped_column(Float)
    protein_100: Mapped[float] = mapped_column(Float, default=0)
    fat_100: Mapped[float] = mapped_column(Float, default=0)
    carb_100: Mapped[float] = mapped_column(Float, default=0)
    fiber_100: Mapped[float] = mapped_column(Float, default=0)
    source: Mapped[str] = mapped_column(String(16), default="custom")  # off / custom / user


class MealEntry(Base):
    """Одна запись приёма пищи в дневнике (значения уже посчитаны на порцию)."""
    __tablename__ = "meal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, index=True)
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType), default=MealType.snack)

    food_id: Mapped[int | None] = mapped_column(ForeignKey("foods.id"))
    name: Mapped[str] = mapped_column(String(256))
    grams: Mapped[float] = mapped_column(Float, default=100)
    kcal: Mapped[float] = mapped_column(Float, default=0)
    protein: Mapped[float] = mapped_column(Float, default=0)
    fat: Mapped[float] = mapped_column(Float, default=0)
    carb: Mapped[float] = mapped_column(Float, default=0)
    fiber: Mapped[float] = mapped_column(Float, default=0)
    method: Mapped[str] = mapped_column(String(16), default="manual")  # manual / barcode / photo
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="meals")


class Workout(Base):
    """Тренировка: расход калорий добавляется к дневной норме."""
    __tablename__ = "workouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, index=True)
    type: Mapped[str] = mapped_column(String(64))
    duration_min: Mapped[int] = mapped_column(Integer, default=0)
    kcal_burned: Mapped[float] = mapped_column(Float, default=0)
    note: Mapped[str | None] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="workouts")


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, index=True)
    weight_kg: Mapped[float] = mapped_column(Float)

    user: Mapped[User] = relationship(back_populates="weights")


class WaterLog(Base):
    __tablename__ = "water_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, index=True)
    ml: Mapped[int] = mapped_column(Integer, default=0)
