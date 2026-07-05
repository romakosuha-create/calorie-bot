import { useState } from "react";
import { Drop, Plus, Minus } from "@phosphor-icons/react";

const GLASS_ML = 200;
const GLASSES = 8;
const GOAL_ML = GLASS_ML * GLASSES; // 1600 мл
const QUICK = [200, 300, 500];

interface WaterTrackerProps {
  ml: number; // выпито, в миллилитрах
  onChange: (ml: number) => void;
}

/** Трекер воды: стаканы тапом + быстрые кнопки + ввод своего значения. */
export function WaterTracker({ ml, onChange }: WaterTrackerProps) {
  const [custom, setCustom] = useState("");
  const filled = Math.round(ml / GLASS_ML);

  const set = (v: number) => onChange(Math.max(0, Math.round(v)));

  const toggleGlass = (i: number) => {
    // тап по последнему заполненному снимает его, иначе доливаем до i+1 стаканов
    set((filled === i + 1 ? i : i + 1) * GLASS_ML);
  };

  const addCustom = () => {
    const v = parseInt(custom, 10);
    if (!Number.isNaN(v) && v !== 0) set(ml + v);
    setCustom("");
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Drop size={18} weight="fill" className="text-gold" />
          <span className="text-sm font-semibold">Вода</span>
        </div>
        <span className="text-sm font-semibold tnum">
          <span className="text-gold">{ml}</span>
          <span className="text-muted"> / {GOAL_ML} мл</span>
        </span>
      </div>

      {/* Стаканы */}
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: GLASSES }).map((_, i) => {
          const active = i < filled;
          return (
            <button
              key={i}
              onClick={() => toggleGlass(i)}
              aria-label={`Стакан ${i + 1}`}
              className={`grid h-11 place-items-center rounded-lg border transition-all active:scale-90 ${
                active ? "border-gold/40 bg-gold-soft" : "border-line bg-elevated"
              }`}
            >
              <Drop size={16} weight={active ? "fill" : "regular"} className={active ? "text-gold" : "text-muted"} />
            </button>
          );
        })}
      </div>

      {/* Быстрые кнопки + своё значение */}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => set(ml + q)}
            className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-ink active:scale-95 transition-transform"
          >
            +{q} мл
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={() => set(ml - GLASS_ML)}
          aria-label="Убавить"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated active:scale-90 transition-transform"
        >
          <Minus size={16} />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-elevated px-3">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            inputMode="numeric"
            placeholder="Своё значение, мл"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted tnum"
          />
          <span className="text-xs text-muted">мл</span>
        </div>
        <button
          onClick={addCustom}
          aria-label="Добавить"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-base active:scale-90 transition-transform"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="mt-3 flex justify-between text-xs text-muted tnum">
        <span>{filled} из {GLASSES} стаканов</span>
        <span>{(ml / 1000).toFixed(2)} л / {(GOAL_ML / 1000).toFixed(1)} л</span>
      </div>
    </section>
  );
}
