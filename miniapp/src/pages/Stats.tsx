import { mockWeek } from "../lib/mock";

export function Stats() {
  const goal = 2150;
  const logged = mockWeek.filter((d) => d.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length) : 0;
  const best = logged.reduce((b, d) => (d.kcal > b.kcal ? d : b), { day: "-", kcal: 0 });
  const maxBar = Math.max(goal, ...mockWeek.map((d) => d.kcal));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Статистика</h1>
        <p className="mt-0.5 text-sm text-muted">Эта неделя</p>
      </header>

      {/* Среднее */}
      <section className="rounded-3xl border border-line bg-surface p-5 ring-top-gold">
        <p className="text-sm text-muted">Среднее за неделю</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tnum">{avg}</span>
          <span className="text-base font-semibold text-muted">ккал</span>
        </div>
        <p className="mt-1 text-sm text-muted tnum">
          Цель: {goal} ккал · <span className="text-gold">{Math.round((avg / goal) * 100)}%</span>
        </p>
      </section>

      {/* Мини-метрики */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-[11px] text-muted">Лучший день</p>
          <p className="mt-1 text-xl font-bold">{best.day}</p>
          <p className="text-xs text-muted tnum">{best.kcal} ккал</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-[11px] text-muted">Дней с записями</p>
          <p className="mt-1 text-xl font-bold tnum">{logged.length} / 7</p>
          <p className="text-xs text-muted">на этой неделе</p>
        </div>
      </section>

      {/* График по дням */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="mb-4 text-sm font-semibold">Калории по дням</p>
        <div className="flex h-40 items-end justify-between gap-2">
          {mockWeek.map((d) => {
            const h = maxBar ? (d.kcal / maxBar) * 100 : 0;
            const reached = d.kcal >= goal * 0.9;
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-md transition-[height] duration-700"
                    style={{
                      height: `${h}%`,
                      minHeight: d.kcal ? 4 : 0,
                      background: reached ? "var(--color-gold)" : "var(--color-line)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
