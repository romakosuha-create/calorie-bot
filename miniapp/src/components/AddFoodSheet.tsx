import { useEffect, useState } from "react";
import { MagnifyingGlass, X, CaretLeft, Check, Minus, Plus } from "@phosphor-icons/react";
import { IS_PREVIEW } from "../lib/telegram";
import { api } from "../lib/api";
import { mockFoods } from "../lib/mock";
import type { Food, Meal, MealType } from "../lib/types";

const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "snack", label: "Перекус" },
];

/** Поиск: mock в preview, Open Food Facts в Telegram. */
async function searchFoods(q: string): Promise<Food[]> {
  if (IS_PREVIEW) {
    const s = q.toLowerCase();
    return mockFoods.filter((f) => f.name.toLowerCase().includes(s));
  }
  try {
    return await api.searchFoods(q);
  } catch {
    return [];
  }
}

interface AddFoodSheetProps {
  onClose: () => void;
  onAdd: (meal: Meal) => void;
}

export function AddFoodSheet({ onClose, onAdd }: AddFoodSheetProps) {
  const [mealType, setMealType] = useState<MealType>("snack");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);

  // Поиск с дебаунсом
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      setResults(await searchFoods(query.trim()));
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const factor = grams / 100;
  const portion = selected && {
    kcal: Math.round(selected.kcal_100 * factor),
    protein: +(selected.protein_100 * factor).toFixed(1),
    fat: +(selected.fat_100 * factor).toFixed(1),
    carb: +(selected.carb_100 * factor).toFixed(1),
    fiber: +(selected.fiber_100 * factor).toFixed(1),
  };

  const confirm = () => {
    if (!selected || !portion) return;
    onAdd({
      id: Date.now(),
      meal_type: mealType,
      name: selected.name,
      grams,
      ...portion,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base">
      {/* Шапка */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button
          onClick={selected ? () => setSelected(null) : onClose}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line active:scale-95"
        >
          {selected ? <CaretLeft size={18} /> : <X size={18} />}
        </button>
        <h2 className="flex-1 font-semibold">{selected ? "Порция" : "Добавить продукт"}</h2>
      </div>

      {!selected ? (
        <div className="flex flex-1 flex-col overflow-hidden px-4 pt-4">
          {/* Приём пищи */}
          <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMealType(m.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  mealType === m.id ? "bg-gold text-base" : "border border-line text-muted"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Поиск */}
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-3">
            <MagnifyingGlass size={18} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название продукта…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>

          {/* Результаты */}
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pb-4">
            {loading && <p className="py-6 text-center text-sm text-muted">Поиск…</p>}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">Ничего не найдено</p>
            )}
            {results.map((f, i) => (
              <button
                key={`${f.name}-${i}`}
                onClick={() => {
                  setSelected(f);
                  setGrams(100);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-[11px] text-muted">{f.brand ?? "на 100 г"}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tnum">{Math.round(f.kcal_100)} ккал</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Экран порции */
        <div className="flex flex-1 flex-col px-4 pt-5">
          <p className="text-lg font-semibold">{selected.name}</p>
          <p className="text-sm text-muted">{selected.brand ?? "продукт"}</p>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
            <button onClick={() => setGrams(Math.max(10, grams - 10))} className="grid h-11 w-11 place-items-center rounded-xl bg-elevated active:scale-90">
              <Minus size={18} />
            </button>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tnum">{grams}</span>
              <span className="font-semibold text-muted">г</span>
            </div>
            <button onClick={() => setGrams(grams + 10)} className="grid h-11 w-11 place-items-center rounded-xl bg-elevated active:scale-90">
              <Plus size={18} />
            </button>
          </div>

          {portion && (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-5 ring-top-gold">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tnum">{portion.kcal}</span>
                <span className="font-semibold text-muted">ккал</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <PMacro label="Белки" v={portion.protein} c="var(--color-protein)" />
                <PMacro label="Жиры" v={portion.fat} c="var(--color-fat)" />
                <PMacro label="Углев." v={portion.carb} c="var(--color-carb)" />
                <PMacro label="Клетч." v={portion.fiber} c="var(--color-gold)" />
              </div>
            </div>
          )}

          <button
            onClick={confirm}
            className="mt-auto mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-base active:scale-[0.98]"
          >
            <Check size={20} weight="bold" /> Добавить в дневник
          </button>
        </div>
      )}
    </div>
  );
}

function PMacro({ label, v, c }: { label: string; v: number; c: string }) {
  return (
    <div>
      <p className="text-base font-bold tnum" style={{ color: c }}>{v}г</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
