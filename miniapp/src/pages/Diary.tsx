import { useState } from "react";
import { Camera, Plus, Barbell, Trash, ForkKnife } from "@phosphor-icons/react";
import { AddFoodSheet } from "../components/AddFoodSheet";
import { WorkoutSheet } from "../components/WorkoutSheet";
import { useStore } from "../lib/store";
import type { MealType } from "../lib/types";

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export function Diary() {
  const { day, addMeal, deleteMeal, addWorkout, deleteWorkout } = useStore();
  const [adding, setAdding] = useState(false);
  const [addingWorkout, setAddingWorkout] = useState(false);
  const totalKcal = Math.round(day.consumed.kcal);

  return (
    <div className="space-y-5">
      {adding && <AddFoodSheet onClose={() => setAdding(false)} onAdd={addMeal} />}
      {addingWorkout && <WorkoutSheet onClose={() => setAddingWorkout(false)} onAdd={addWorkout} />}

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Дневник</h1>
      </header>

      {/* Сводка приёмов */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <span className="text-sm text-muted">
          Сегодня · <span className="text-ink">{day.meals.length} приёмов</span>
        </span>
        <span className="text-sm font-semibold tnum">{totalKcal} ккал</span>
      </div>

      {/* Список приёмов */}
      {day.meals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center">
          <ForkKnife size={28} className="text-muted" />
          <p className="text-sm text-muted">Нет приёмов пищи</p>
          <p className="text-xs text-muted">Нажми «Добавить» ниже</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {day.meals.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gold">{MEAL_LABEL[m.meal_type]}</p>
                  <p className="mt-0.5 truncate font-semibold">{m.name}</p>
                  {m.grams > 0 && <p className="mt-0.5 text-xs text-muted tnum">{m.grams} г</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-lg font-bold tnum">{Math.round(m.kcal)}</span>
                  <button
                    onClick={() => deleteMeal(m.id)}
                    aria-label="Удалить"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-elevated text-muted active:scale-90 transition-transform"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs tnum">
                <MacroTag label="Б" value={m.protein} color="var(--color-protein)" />
                <MacroTag label="Ж" value={m.fat} color="var(--color-fat)" />
                <MacroTag label="У" value={m.carb} color="var(--color-carb)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Тренировки */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Тренировки</span>
          <button onClick={() => setAddingWorkout(true)} className="flex items-center gap-1 text-xs font-semibold text-gold active:scale-95">
            <Plus size={13} weight="bold" /> Добавить
          </button>
        </div>
        {day.workouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-5 text-center text-xs text-muted">Тренировок пока нет</div>
        ) : (
          <div className="space-y-2.5">
            {day.workouts.map((w) => (
              <div key={w.id} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft">
                  <Barbell size={18} weight="fill" className="text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{w.type}</p>
                  <p className="text-[11px] text-muted tnum">{w.duration_min} мин</p>
                </div>
                <span className="text-sm font-bold text-gold tnum">+{Math.round(w.kcal_burned)}</span>
                <button
                  onClick={() => deleteWorkout(w.id)}
                  aria-label="Удалить"
                  className="grid h-7 w-7 place-items-center rounded-lg bg-elevated text-muted active:scale-90 transition-transform"
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Добавление */}
      <div className="grid grid-cols-2 gap-3">
        <AddButton Icon={Camera} label="Фото еды" hint="скоро · AI" />
        <AddButton Icon={Plus} label="Добавить" hint="поиск / вручную" onClick={() => setAdding(true)} />
      </div>
    </div>
  );
}

function MacroTag({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-1">
      <span style={{ color }}>{label}</span>
      <span className="text-ink">{Math.round(value)}</span>
    </span>
  );
}

function AddButton({ Icon, label, hint, onClick }: { Icon: typeof Camera; label: string; hint: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-surface p-4 text-left active:scale-[0.98] transition-transform">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft">
        <Icon size={18} weight="fill" className="text-gold" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted">{hint}</p>
      </div>
    </button>
  );
}
