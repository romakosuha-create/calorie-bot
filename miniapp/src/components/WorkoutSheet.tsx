import { useState } from "react";
import { X, Check, Minus, Plus, Barbell } from "@phosphor-icons/react";
import type { Workout } from "../lib/types";

// Примерный расход ккал в минуту по типу (для автоподсказки)
const TYPES: { label: string; perMin: number }[] = [
  { label: "Силовая", perMin: 6 },
  { label: "Бег", perMin: 11 },
  { label: "Ходьба", perMin: 4 },
  { label: "Велосипед", perMin: 8 },
  { label: "Плавание", perMin: 9 },
  { label: "Йога", perMin: 3 },
];

interface WorkoutSheetProps {
  onClose: () => void;
  onAdd: (w: Omit<Workout, "id">) => void;
}

export function WorkoutSheet({ onClose, onAdd }: WorkoutSheetProps) {
  const [type, setType] = useState(TYPES[0].label);
  const [duration, setDuration] = useState(45);
  const [kcal, setKcal] = useState("");

  const perMin = TYPES.find((t) => t.label === type)?.perMin ?? 6;
  const estimate = Math.round(perMin * duration);
  const finalKcal = kcal.trim() ? Math.round(parseFloat(kcal.replace(",", ".")) || 0) : estimate;

  const confirm = () => {
    onAdd({ type, duration_min: duration, kcal_burned: finalKcal });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-line active:scale-95">
          <X size={18} />
        </button>
        <h2 className="flex-1 font-semibold">Добавить тренировку</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pt-5">
        {/* Тип */}
        <div>
          <p className="mb-2 text-xs text-muted">Тип тренировки</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.label}
                onClick={() => setType(t.label)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  type === t.label ? "bg-gold text-base" : "border border-line text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Длительность */}
        <div>
          <p className="mb-2 text-xs text-muted">Длительность</p>
          <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
            <button onClick={() => setDuration(Math.max(5, duration - 5))} className="grid h-11 w-11 place-items-center rounded-xl bg-elevated active:scale-90">
              <Minus size={18} />
            </button>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tnum">{duration}</span>
              <span className="font-semibold text-muted">мин</span>
            </div>
            <button onClick={() => setDuration(duration + 5)} className="grid h-11 w-11 place-items-center rounded-xl bg-elevated active:scale-90">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Расход */}
        <div className="rounded-2xl border border-line bg-surface p-5 ring-top-gold">
          <div className="mb-3 flex items-center gap-2">
            <Barbell size={18} weight="fill" className="text-gold" />
            <p className="text-sm font-semibold">Сожжено</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-elevated px-3">
            <input
              value={kcal}
              onChange={(e) => setKcal(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder={`${estimate}`}
              className="w-full bg-transparent py-2.5 text-lg font-bold outline-none placeholder:text-muted tnum"
            />
            <span className="text-sm text-muted">ккал</span>
          </div>
          <p className="mt-2 text-[11px] text-muted">Оставь пустым — посчитаю примерно ({estimate} ккал)</p>
        </div>
      </div>

      <div className="border-t border-line p-4">
        <button
          onClick={confirm}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-base active:scale-[0.98]"
        >
          <Check size={20} weight="bold" /> Добавить · +{finalKcal} ккал
        </button>
      </div>
    </div>
  );
}
