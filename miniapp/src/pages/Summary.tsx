import { useState } from "react";
import { Flame, Barbell, Plant, Plus } from "@phosphor-icons/react";
import { Ring } from "../components/Ring";
import { WeekStrip } from "../components/WeekStrip";
import { WaterTracker } from "../components/WaterTracker";
import { AddFoodSheet } from "../components/AddFoodSheet";
import { WorkoutSheet } from "../components/WorkoutSheet";
import { useStore } from "../lib/store";

const MACROS = [
  { key: "protein", label: "Белки", color: "var(--color-protein)" },
  { key: "fat", label: "Жиры", color: "var(--color-fat)" },
  { key: "carb", label: "Углеводы", color: "var(--color-carb)" },
] as const;

export function Summary() {
  const { day, addMeal, setWater, setWaterGoal, addWorkout } = useStore();
  const today = new Date();
  const [selected, setSelected] = useState((today.getDay() + 6) % 7);
  const [adding, setAdding] = useState(false);
  const [addingWorkout, setAddingWorkout] = useState(false);

  const eaten = Math.round(day.consumed.kcal);
  const goal = Math.round(day.targets.kcal + day.burned_kcal);
  const pct = goal ? Math.round((eaten / goal) * 100) : 0;
  const remaining = Math.round(day.remaining_kcal);
  const fiber = { value: Math.round(day.consumed.fiber), target: Math.round(day.targets.fiber) };
  const dateLabel = today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-5">
      {adding && <AddFoodSheet onClose={() => setAdding(false)} onAdd={addMeal} />}
      {addingWorkout && <WorkoutSheet onClose={() => setAddingWorkout(false)} onAdd={addWorkout} />}

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сегодня</h1>
          <p className="mt-0.5 text-sm capitalize text-muted">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5">
          <Flame size={16} weight="fill" className="text-gold" />
          <span className="text-sm font-semibold text-gold tnum">5 дней</span>
        </div>
      </header>

      <WeekStrip selected={selected} onSelect={setSelected} />

      {/* Главная карточка калорий */}
      <section className="rounded-3xl border border-line bg-surface p-5 ring-top-gold">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted">Съедено сегодня</p>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-base active:scale-95 transition-transform"
          >
            <Plus size={14} weight="bold" /> Добавить
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tnum">{eaten}</span>
          <span className="text-lg font-semibold text-muted">/ {goal} ккал</span>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="mt-2.5 flex justify-between text-sm">
          <span className={remaining >= 0 ? "text-gold" : "text-fat"}>
            {remaining >= 0 ? `Осталось ${remaining} ккал` : `Превышено на ${-remaining} ккал`}
          </span>
          <span className="text-muted tnum">{pct}%</span>
        </div>
      </section>

      {/* Кольца макросов с быстрым добавлением */}
      <section className="grid grid-cols-3 gap-3">
        {MACROS.map((m) => {
          const value = Math.round(day.consumed[m.key]);
          const target = Math.round(day.targets[m.key]);
          const p = target ? Math.round((value / target) * 100) : 0;
          return (
            <div key={m.key} className="relative flex flex-col items-center rounded-2xl border border-line bg-surface py-4">
              <button
                onClick={() => setAdding(true)}
                aria-label={`Добавить ${m.label}`}
                className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-elevated text-muted active:scale-90 transition-transform"
              >
                <Plus size={13} weight="bold" />
              </button>
              <Ring value={value} max={target} color={m.color} size={68}>
                <span className="text-xs font-semibold tnum" style={{ color: m.color }}>{p}%</span>
              </Ring>
              <p className="mt-2 text-sm font-semibold tnum">{value} г</p>
              <p className="text-[11px] text-muted">{m.label} · /{target}</p>
            </div>
          );
        })}
      </section>

      {/* Клетчатка */}
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plant size={18} weight="fill" className="text-gold" />
            <span className="text-sm font-semibold">Клетчатка</span>
          </div>
          <span className="text-sm font-semibold tnum">
            <span className="text-ink">{fiber.value}</span>
            <span className="text-muted"> / {fiber.target} г</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${fiber.target ? Math.min((fiber.value / fiber.target) * 100, 100) : 0}%` }} />
        </div>
      </section>

      {/* Вода */}
      <WaterTracker ml={day.water_ml} goalMl={day.water_goal_ml} onChange={setWater} onGoalChange={setWaterGoal} />

      {/* Тренировки */}
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft">
              <Barbell size={18} weight="fill" className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">Тренировки</p>
              <p className="text-[11px] text-muted">
                {day.workouts.length ? `${day.workouts.length} шт · сожжено` : "Нет тренировок"}
              </p>
            </div>
          </div>
          {day.burned_kcal > 0 ? (
            <div className="text-right">
              <p className="text-sm font-bold text-gold tnum">+{Math.round(day.burned_kcal)}</p>
              <p className="text-[11px] text-muted">ккал</p>
            </div>
          ) : (
            <button
              onClick={() => setAddingWorkout(true)}
              className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-base active:scale-95 transition-transform"
            >
              <Plus size={14} weight="bold" /> Добавить
            </button>
          )}
        </div>
        {day.burned_kcal > 0 && (
          <button
            onClick={() => setAddingWorkout(true)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-line py-2 text-xs font-medium text-muted active:scale-[0.98] transition-transform"
          >
            <Plus size={13} weight="bold" /> Ещё тренировку
          </button>
        )}
      </section>
    </div>
  );
}
