import { useState } from "react";
import { Flame, Barbell, Plant } from "@phosphor-icons/react";
import { Ring } from "../components/Ring";
import { WeekStrip } from "../components/WeekStrip";
import { WaterTracker } from "../components/WaterTracker";
import { mockDay, mockWorkouts } from "../lib/mock";

const MACROS = [
  { key: "protein", label: "Белки", color: "var(--color-protein)" },
  { key: "fat", label: "Жиры", color: "var(--color-fat)" },
  { key: "carb", label: "Углеводы", color: "var(--color-carb)" },
] as const;

export function Summary() {
  const today = new Date();
  const [selected, setSelected] = useState((today.getDay() + 6) % 7);
  const [water, setWater] = useState(3);
  const day = mockDay; // TODO: api.getDay(date) в Telegram

  const fiber = { value: Math.round(day.consumed.fiber), target: Math.round(day.targets.fiber) };

  const eaten = Math.round(day.consumed.kcal);
  const goal = day.targets.kcal + day.burned_kcal;
  const pct = Math.round((eaten / goal) * 100);
  const remaining = Math.round(day.remaining_kcal);

  const dateLabel = today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-5">
      {/* Заголовок + стрик */}
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
        <p className="text-sm text-muted">Съедено сегодня</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tnum">{eaten}</span>
          <span className="text-lg font-semibold text-muted">/ {goal} ккал</span>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div className="mt-2.5 flex justify-between text-sm">
          <span className={remaining >= 0 ? "text-gold" : "text-fat"}>
            {remaining >= 0 ? `Осталось ${remaining} ккал` : `Превышено на ${-remaining} ккал`}
          </span>
          <span className="text-muted tnum">{pct}%</span>
        </div>
      </section>

      {/* Кольца макросов */}
      <section className="grid grid-cols-3 gap-3">
        {MACROS.map((m) => {
          const value = Math.round(day.consumed[m.key]);
          const target = Math.round(day.targets[m.key]);
          const p = target ? Math.round((value / target) * 100) : 0;
          return (
            <div key={m.key} className="flex flex-col items-center rounded-2xl border border-line bg-surface py-4">
              <Ring value={value} max={target} color={m.color} size={68}>
                <span className="text-xs font-semibold tnum" style={{ color: m.color }}>
                  {p}%
                </span>
              </Ring>
              <p className="mt-2 text-sm font-semibold tnum">{value} г</p>
              <p className="text-[11px] text-muted">
                {m.label} · /{target}
              </p>
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
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-700"
            style={{ width: `${Math.min((fiber.value / fiber.target) * 100, 100)}%` }}
          />
        </div>
      </section>

      {/* Вода */}
      <WaterTracker filled={water} onChange={setWater} />

      {/* Тренировки */}
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-soft">
              <Barbell size={18} weight="fill" className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">Тренировки</p>
              <p className="text-[11px] text-muted">{mockWorkouts[0].type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gold tnum">+{day.burned_kcal}</p>
            <p className="text-[11px] text-muted">ккал сожжено</p>
          </div>
        </div>
      </section>
    </div>
  );
}
