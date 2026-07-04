import { useState } from "react";
import {
  Flame,
  Heart,
  Drop,
  Pulse,
  Bell,
  Gear,
  Scales,
  ChartLineUp,
  ShareNetwork,
  CaretRight,
} from "@phosphor-icons/react";

const GOAL = { kcal: 2150, protein: 161, fat: 72, carb: 215 };

const MACRO_GOALS = [
  { Icon: Flame, label: "Калории", value: `${GOAL.kcal} ккал`, color: "var(--color-gold)" },
  { Icon: Heart, label: "Белки", value: `${GOAL.protein} г`, color: "var(--color-protein)" },
  { Icon: Drop, label: "Жиры", value: `${GOAL.fat} г`, color: "var(--color-fat)" },
  { Icon: Pulse, label: "Углеводы", value: `${GOAL.carb} г`, color: "var(--color-carb)" },
];

export function Profile() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-xl font-bold text-gold">
          R
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Roma</h1>
          <p className="text-sm text-muted">Цель: поддержание веса</p>
        </div>
      </header>

      {/* ЦЕЛИ */}
      <section className="space-y-2.5">
        <SectionTitle>Цели</SectionTitle>

        {/* Переключатель Авто / Ручной */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-elevated p-1">
          {(["auto", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === m ? "bg-gold text-base" : "text-muted"
              }`}
            >
              {m === "auto" ? "Авто" : "Ручной"}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {MACRO_GOALS.map((g, i) => (
            <button
              key={g.label}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevated transition-colors ${
                i < MACRO_GOALS.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: "color-mix(in srgb, " + g.color + " 16%, transparent)" }}
              >
                <g.Icon size={18} weight="fill" style={{ color: g.color }} />
              </div>
              <span className="flex-1 text-sm font-medium">{g.label}</span>
              <span className="text-sm text-muted tnum">{g.value}</span>
              {mode === "manual" && <CaretRight size={16} className="text-muted" />}
            </button>
          ))}
        </div>
        {mode === "auto" && (
          <p className="px-1 text-xs text-muted">Рассчитано автоматически из анкеты</p>
        )}
      </section>

      {/* ВЕС */}
      <section className="space-y-2.5">
        <SectionTitle>Вес</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Row Icon={ChartLineUp} label="Трекер веса" hint="График, история, цели" />
          <Row Icon={Scales} label="Текущий вес" value="78 кг" last />
        </div>
      </section>

      {/* ПРОЧЕЕ */}
      <section className="space-y-2.5">
        <SectionTitle>Прочее</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Row Icon={ShareNetwork} label="Пригласить друга" badge="+3 дня" />
          <Row Icon={Drop} label="Норма воды" value="1.6 л" />
          <Row Icon={Bell} label="Напоминания" value="Вкл" />
          <Row Icon={Gear} label="Настройки" last />
        </div>
      </section>

      <p className="text-center text-xs text-muted">@ccallories_bot · v0.1</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">{children}</p>;
}

function Row({
  Icon,
  label,
  hint,
  value,
  badge,
  last,
}: {
  Icon: typeof Bell;
  label: string;
  hint?: string;
  value?: string;
  badge?: string;
  last?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevated transition-colors ${
        last ? "" : "border-b border-line"
      }`}
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-elevated">
        <Icon size={18} className="text-muted" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted">{hint}</p>}
      </div>
      {badge && (
        <span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">
          {badge}
        </span>
      )}
      {value && <span className="text-sm text-muted tnum">{value}</span>}
      <CaretRight size={16} className="text-muted" />
    </button>
  );
}
