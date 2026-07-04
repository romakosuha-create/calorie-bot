import { Drop } from "@phosphor-icons/react";

const GLASS_ML = 200;
const GLASSES = 8;

interface WaterTrackerProps {
  filled: number; // сколько стаканов выпито 0..8
  onChange: (n: number) => void;
}

/** Трекер воды: 8 стаканов, тап по стакану = выпито до этого включительно. */
export function WaterTracker({ filled, onChange }: WaterTrackerProps) {
  const goalMl = GLASSES * GLASS_ML;
  const ml = filled * GLASS_ML;

  const toggle = (i: number) => {
    // тап по последнему заполненному снимает его, иначе доливаем до i+1
    onChange(filled === i + 1 ? i : i + 1);
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Drop size={18} weight="fill" className="text-gold" />
          <span className="text-sm font-semibold">Вода</span>
        </div>
        <span className="text-sm font-semibold tnum">
          <span className="text-gold">{filled}</span>
          <span className="text-muted"> / {GLASSES} стаканов</span>
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: GLASSES }).map((_, i) => {
          const active = i < filled;
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              aria-label={`Стакан ${i + 1}`}
              className={`grid h-11 place-items-center rounded-lg border transition-all active:scale-90 ${
                active ? "border-gold/40 bg-gold-soft" : "border-line bg-elevated"
              }`}
            >
              <Drop
                size={16}
                weight={active ? "fill" : "regular"}
                className={active ? "text-gold" : "text-muted"}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-xs text-muted tnum">
        <span>Выпито {ml} мл</span>
        <span>
          {(ml / 1000).toFixed(1)} л / {(goalMl / 1000).toFixed(1)} л
        </span>
      </div>
    </section>
  );
}
