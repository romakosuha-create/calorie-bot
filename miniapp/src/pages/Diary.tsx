import { useState } from "react";
import { Barcode, Camera, Plus, Barbell } from "@phosphor-icons/react";
import { AddFoodSheet } from "../components/AddFoodSheet";
import { mockMeals, mockWorkouts } from "../lib/mock";
import type { Meal, MealType } from "../lib/types";

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export function Diary() {
  const [meals, setMeals] = useState<Meal[]>(mockMeals); // TODO: реальные данные дня
  const [adding, setAdding] = useState(false);
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);

  const addMeal = (m: Meal) => setMeals((prev) => [...prev, m]);

  return (
    <div className="space-y-5">
      {adding && <AddFoodSheet onClose={() => setAdding(false)} onAdd={addMeal} />}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Дневник</h1>
        <button className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface active:scale-95 transition-transform">
          <Barcode size={18} className="text-gold" />
        </button>
      </header>

      {/* Сводка приёмов */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <span className="text-sm text-muted">
          Сегодня · <span className="text-ink">{meals.length} приёма</span>
        </span>
        <span className="text-sm font-semibold tnum">{totalKcal} ккал</span>
      </div>

      {/* Список приёмов */}
      <div className="space-y-2.5">
        {meals.map((m) => (
          <div key={m.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gold">
                  {MEAL_LABEL[m.meal_type]}
                </p>
                <p className="mt-0.5 truncate font-semibold">{m.name}</p>
                <p className="mt-0.5 text-xs text-muted tnum">{m.grams} г</p>
              </div>
              <span className="shrink-0 text-lg font-bold tnum">{m.kcal}</span>
            </div>
            <div className="mt-3 flex gap-4 text-xs tnum">
              <MacroTag label="Б" value={m.protein} color="var(--color-protein)" />
              <MacroTag label="Ж" value={m.fat} color="var(--color-fat)" />
              <MacroTag label="У" value={m.carb} color="var(--color-carb)" />
            </div>
          </div>
        ))}
      </div>

      {/* Тренировка в дневнике */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft">
            <Barbell size={18} weight="fill" className="text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{mockWorkouts[0].type}</p>
            <p className="text-[11px] text-muted tnum">{mockWorkouts[0].duration_min} мин</p>
          </div>
          <span className="text-sm font-bold text-gold tnum">+{mockWorkouts[0].kcal_burned} ккал</span>
        </div>
      </div>

      {/* Добавление */}
      <div className="grid grid-cols-2 gap-3">
        <AddButton Icon={Camera} label="Фото еды" hint="скоро · AI" />
        <AddButton Icon={Plus} label="Добавить" hint="поиск продукта" onClick={() => setAdding(true)} />
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
