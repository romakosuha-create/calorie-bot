"""API-роуты мини-аппа: профиль, онбординг, дневник, сводка дня."""
from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.base import get_db
from app.models import MealEntry, User, WaterLog, WeightLog, Workout
from app.schemas import (
    DaySummary,
    FoodOut,
    MacroTotals,
    MealIn,
    MealOut,
    OnboardingIn,
    SettingsPatch,
    UserOut,
    WaterSet,
    WeightIn,
    WeightOut,
    WorkoutIn,
    WorkoutOut,
)
from app.services import products
from app.services.nutrition import calc_targets

# Клетчатка: рекомендация ~14 г на 1000 ккал
FIBER_PER_1000_KCAL = 14

router = APIRouter(prefix="/api")


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/onboarding", response_model=UserOut)
async def onboarding(
    data: OnboardingIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Сохраняет анкету и рассчитывает норму калорий/макросов."""
    targets = calc_targets(
        gender=data.gender,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
        birth_year=data.birth_year,
        activity=data.activity,
        goal=data.goal,
    )
    for field, value in data.model_dump().items():
        setattr(user, field, value)
    for field, value in targets.items():
        setattr(user, field, value)
    user.onboarded = True

    await db.commit()
    await db.refresh(user)
    return user


@router.get("/day/{day}", response_model=DaySummary)
async def day_summary(
    day: date_type,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Сводка за конкретный день: цели, съедено, сожжено, приёмы пищи."""
    meals = (
        await db.execute(
            select(MealEntry).where(
                MealEntry.user_id == user.id, MealEntry.entry_date == day
            )
        )
    ).scalars().all()

    workouts = (
        await db.execute(
            select(Workout).where(Workout.user_id == user.id, Workout.entry_date == day)
        )
    ).scalars().all()

    water_ml = (
        await db.execute(
            select(WaterLog.ml).where(WaterLog.user_id == user.id, WaterLog.entry_date == day)
        )
    ).scalar_one_or_none() or 0

    consumed = MacroTotals(
        kcal=sum(m.kcal for m in meals),
        protein=sum(m.protein for m in meals),
        fat=sum(m.fat for m in meals),
        carb=sum(m.carb for m in meals),
        fiber=sum(m.fiber for m in meals),
    )
    burned = sum(w.kcal_burned for w in workouts)
    kcal_target = user.calorie_target or 0
    targets = MacroTotals(
        kcal=kcal_target,
        protein=user.protein_target or 0,
        fat=user.fat_target or 0,
        carb=user.carb_target or 0,
        fiber=round(kcal_target / 1000 * FIBER_PER_1000_KCAL),
    )
    remaining = targets.kcal + burned - consumed.kcal

    return DaySummary(
        entry_date=day,
        targets=targets,
        consumed=consumed,
        burned_kcal=burned,
        remaining_kcal=remaining,
        water_ml=water_ml,
        water_goal_ml=user.water_goal_ml or 1600,
        meals=[MealOut.model_validate(m) for m in meals],
        workouts=[WorkoutOut.model_validate(w) for w in workouts],
    )


@router.post("/meals", response_model=MealOut, status_code=status.HTTP_201_CREATED)
async def add_meal(
    data: MealIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meal = MealEntry(user_id=user.id, **data.model_dump())
    db.add(meal)
    await db.commit()
    await db.refresh(meal)
    return meal


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(
    meal_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meal = (
        await db.execute(
            select(MealEntry).where(MealEntry.id == meal_id, MealEntry.user_id == user.id)
        )
    ).scalar_one_or_none()
    if meal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Приём не найден")
    await db.delete(meal)
    await db.commit()


@router.get("/foods/search", response_model=list[FoodOut])
async def foods_search(q: str, _: User = Depends(get_current_user)):
    """Поиск продуктов по названию (Open Food Facts)."""
    if len(q.strip()) < 2:
        return []
    return await products.search_foods(q.strip())


@router.get("/foods/barcode/{barcode}", response_model=FoodOut)
async def foods_barcode(barcode: str, _: User = Depends(get_current_user)):
    """Распознавание продукта по штрихкоду (Open Food Facts)."""
    food = await products.lookup_barcode(barcode)
    if food is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Продукт не найден")
    return food


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: SettingsPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Обновление целей/настроек (норма воды, ручные цели по ккал/Б/Ж/У)."""
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/water", status_code=status.HTTP_204_NO_CONTENT)
async def set_water(
    data: WaterSet,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Устанавливает объём воды за день (абсолютное значение, мл)."""
    log = (
        await db.execute(
            select(WaterLog).where(
                WaterLog.user_id == user.id, WaterLog.entry_date == data.entry_date
            )
        )
    ).scalar_one_or_none()
    if log is None:
        db.add(WaterLog(user_id=user.id, entry_date=data.entry_date, ml=data.ml))
    else:
        log.ml = data.ml
    await db.commit()


@router.post("/workouts", response_model=WorkoutOut, status_code=status.HTTP_201_CREATED)
async def add_workout(
    data: WorkoutIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workout = Workout(user_id=user.id, **data.model_dump())
    db.add(workout)
    await db.commit()
    await db.refresh(workout)
    return workout


@router.delete("/workouts/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workout = (
        await db.execute(
            select(Workout).where(Workout.id == workout_id, Workout.user_id == user.id)
        )
    ).scalar_one_or_none()
    if workout is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Тренировка не найдена")
    await db.delete(workout)
    await db.commit()


@router.post("/weight", status_code=status.HTTP_204_NO_CONTENT)
async def set_weight(
    data: WeightIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Записывает вес за день (одна запись на дату) и обновляет текущий вес."""
    log = (
        await db.execute(
            select(WeightLog).where(
                WeightLog.user_id == user.id, WeightLog.entry_date == data.entry_date
            )
        )
    ).scalar_one_or_none()
    if log is None:
        db.add(WeightLog(user_id=user.id, entry_date=data.entry_date, weight_kg=data.weight_kg))
    else:
        log.weight_kg = data.weight_kg
    user.weight_kg = data.weight_kg
    await db.commit()


@router.get("/weight", response_model=list[WeightOut])
async def weight_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(WeightLog)
            .where(WeightLog.user_id == user.id)
            .order_by(WeightLog.entry_date)
        )
    ).scalars().all()
    return [WeightOut.model_validate(r) for r in rows]
