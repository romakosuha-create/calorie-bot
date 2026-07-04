const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface WeekStripProps {
  selected: number; // индекс дня 0..6
  onSelect: (i: number) => void;
}

/** Горизонтальная лента дней недели с выделением текущего. */
export function WeekStrip({ selected, onSelect }: WeekStripProps) {
  // Понедельник текущей недели
  const today = new Date();
  const monday = new Date(today);
  const shift = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - shift);

  return (
    <div className="grid grid-cols-7 gap-1">
      {DOW.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const active = i === selected;
        const isToday = i === shift;
        return (
          <button
            key={label}
            onClick={() => onSelect(i)}
            className="flex flex-col items-center gap-1.5 py-1.5 active:scale-[0.96] transition-transform"
          >
            <span className={`text-[11px] font-medium ${active ? "text-gold" : "text-muted"}`}>
              {label}
            </span>
            <span
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold tnum transition-colors ${
                active
                  ? "bg-gold text-base"
                  : isToday
                    ? "text-gold ring-1 ring-gold/40"
                    : "text-ink/80"
              }`}
            >
              {d.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
