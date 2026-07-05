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
  onAdd: (meal: Omit<Meal, "id">) => void;
  initialMealType?: MealType;
}

export function AddFoodSheet({ onClose, onAdd, initialMealType = "snack" }: AddFoodSheetProps) {
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [mode, setMode] = useState<"search" | "manual">("search");

  // поиск
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);

  // ручной ввод
  const [mName, setMName] = useState("");
  const [mKcal, setMKcal] = useState("");
  const [mP, setMP] = useState("");
  const [mF, setMF] = useState("");
  const [mC, setMC] = useState("");

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

  const confirmSearch = () => {
    if (!selected || !portion) return;
    onAdd({ meal_type: mealType, name: selected.name, grams, ...portion });
    onClose();
  };

  const confirmManual = () => {
    const kcal = parseFloat(mKcal.replace(",", "."));
    if (!mName.trim() || Number.isNaN(kcal)) return;
    onAdd({
      meal_type: mealType,
      name: mName.trim(),
      grams: 0,
      kcal,
      protein: parseFloat(mP.replace(",", ".")) || 0,
      fat: parseFloat(mF.replace(",", ".")) || 0,
      carb: parseFloat(mC.replace(",", ".")) || 0,
      fiber: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button
          onClick={selected ? () => setSelected(null) : onClose}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line active:scale-95"
        >
          {selected ? <CaretLeft size={18} /> : <X size={18} />}
        </button>
        <h2 className="flex-1 font-semibold">{selected ? "Порция" : "Добавить приём"}</h2>
      </div>

      {selected ? (
        <PortionView
          selected={selected}
          grams={grams}
          setGrams={setGrams}
          portion={portion!}
          onConfirm={confirmSearch}
        />
      ) : (
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

          {/* Режим */}
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-line bg-elevated p-1">
            {(["search", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  mode === m ? "bg-gold text-base" : "text-muted"
                }`}
              >
                {m === "search" ? "Поиск" : "Вручную"}
              </button>
            ))}
          </div>

          {mode === "search" ? (
            <>
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
              <div className="mt-3 flex-1 space-y-2 overflow-y-auto pb-4">
                {loading && <p className="py-6 text-center text-sm text-muted">Поиск…</p>}
                {!loading && query.trim().length >= 2 && results.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted">Ничего не найдено · попробуй «Вручную»</p>
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
            </>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              <Field label="Название" value={mName} onChange={setMName} placeholder="Напр. Протеиновый коктейль" text />
              <Field label="Калории, ккал" value={mKcal} onChange={setMKcal} placeholder="0" />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Белки, г" value={mP} onChange={setMP} placeholder="0" />
                <Field label="Жиры, г" value={mF} onChange={setMF} placeholder="0" />
                <Field label="Углев., г" value={mC} onChange={setMC} placeholder="0" />
              </div>
              <button
                onClick={confirmManual}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-base active:scale-[0.98]"
              >
                <Check size={20} weight="bold" /> Добавить в дневник
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PortionView({
  selected,
  grams,
  setGrams,
  portion,
  onConfirm,
}: {
  selected: Food;
  grams: number;
  setGrams: (g: number) => void;
  portion: { kcal: number; protein: number; fat: number; carb: number; fiber: number };
  onConfirm: () => void;
}) {
  return (
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

      <button
        onClick={onConfirm}
        className="mt-auto mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-base active:scale-[0.98]"
      >
        <Check size={20} weight="bold" /> Добавить в дневник
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  text,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  text?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(text ? e.target.value : e.target.value.replace(/[^0-9.,]/g, ""))}
        inputMode={text ? "text" : "decimal"}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-muted"
      />
    </label>
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
