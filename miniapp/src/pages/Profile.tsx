import { useState } from "react";
import {
  Flame, Heart, Drop, Pulse, Bell, ShareNetwork, Scales, Check, PencilSimple, CaretRight,
} from "@phosphor-icons/react";
import { useStore } from "../lib/store";

export function Profile() {
  const { day, weights, addWeight, setTargets, setWaterGoal } = useStore();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [remind, setRemind] = useState(true);

  const t = day.targets;
  const macroGoals = [
    { key: "kcal" as const, Icon: Flame, label: "Калории", unit: "ккал", color: "var(--color-gold)", value: Math.round(t.kcal) },
    { key: "protein" as const, Icon: Heart, label: "Белки", unit: "г", color: "var(--color-protein)", value: Math.round(t.protein) },
    { key: "fat" as const, Icon: Drop, label: "Жиры", unit: "г", color: "var(--color-fat)", value: Math.round(t.fat) },
    { key: "carb" as const, Icon: Pulse, label: "Углеводы", unit: "г", color: "var(--color-carb)", value: Math.round(t.carb) },
  ];

  const currentWeight = weights.length ? weights[weights.length - 1].weight_kg : null;
  const firstWeight = weights.length ? weights[0].weight_kg : null;
  const delta = currentWeight != null && firstWeight != null ? +(currentWeight - firstWeight).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-xl font-bold text-gold">R</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Roma</h1>
          <p className="text-sm text-muted">Цель: поддержание веса</p>
        </div>
      </header>

      {/* ЦЕЛИ */}
      <section className="space-y-2.5">
        <SectionTitle>Цели</SectionTitle>
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-elevated p-1">
          {(["auto", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${mode === m ? "bg-gold text-base" : "text-muted"}`}
            >
              {m === "auto" ? "Авто" : "Ручной"}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {macroGoals.map((g, i) => (
            <GoalRow
              key={g.key}
              Icon={g.Icon}
              label={g.label}
              unit={g.unit}
              color={g.color}
              value={g.value}
              editable={mode === "manual"}
              onSave={(v) => {
                const patch: Partial<{ kcal: number; protein: number; fat: number; carb: number }> = {};
                patch[g.key] = v;
                setTargets(patch);
              }}
              last={i === macroGoals.length - 1}
            />
          ))}
        </div>
        {mode === "auto" ? (
          <p className="px-1 text-xs text-muted">Рассчитано автоматически из анкеты</p>
        ) : (
          <p className="px-1 text-xs text-muted">Нажми на значение, чтобы изменить</p>
        )}
      </section>

      {/* ВЕС */}
      <section className="space-y-2.5">
        <SectionTitle>Вес</SectionTitle>
        <div className="rounded-2xl border border-line bg-surface p-5 ring-top-gold">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted">Текущий вес</p>
              <p className="mt-1 text-3xl font-extrabold tnum">
                {currentWeight != null ? currentWeight : "—"}
                <span className="ml-1 text-base font-semibold text-muted">кг</span>
              </p>
            </div>
            {delta != null && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${delta <= 0 ? "bg-gold-soft text-gold" : "bg-elevated text-fat"}`}>
                {delta > 0 ? "+" : ""}{delta} кг
              </span>
            )}
          </div>
          {weights.length > 1 && <Sparkline points={weights.map((w) => w.weight_kg)} />}
          <WeightInput onAdd={addWeight} />
        </div>
      </section>

      {/* ПРОЧЕЕ */}
      <section className="space-y-2.5">
        <SectionTitle>Прочее</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <WaterGoalRow value={day.water_goal_ml} onSave={setWaterGoal} />
          <ToggleRow Icon={Bell} label="Напоминания" value={remind} onToggle={() => setRemind((v) => !v)} />
          <Row Icon={ShareNetwork} label="Пригласить друга" badge="+3 дня" last />
        </div>
      </section>

      <p className="text-center text-xs text-muted">@ppeshkazoh_bot · v0.2</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">{children}</p>;
}

function GoalRow({ Icon, label, unit, color, value, editable, onSave, last }: {
  Icon: typeof Bell; label: string; unit: string; color: string; value: number;
  editable: boolean; onSave: (v: number) => void; last?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const save = () => {
    const v = parseInt(draft, 10);
    if (!Number.isNaN(v) && v >= 0) onSave(v);
    setEditing(false);
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-line"}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
        <Icon size={18} weight="fill" style={{ color }} />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {editable && editing ? (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            inputMode="numeric"
            className="w-20 rounded-lg border border-line bg-elevated px-2 py-1 text-right text-sm outline-none tnum"
          />
          <button onClick={save} className="grid h-7 w-7 place-items-center rounded-lg bg-gold text-base active:scale-90">
            <Check size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <button
          disabled={!editable}
          onClick={() => { setDraft(String(value)); setEditing(true); }}
          className={`flex items-center gap-1.5 text-sm tnum ${editable ? "text-ink active:scale-95" : "text-muted"}`}
        >
          {value} {unit}
          {editable && <PencilSimple size={13} className="text-muted" />}
        </button>
      )}
    </div>
  );
}

function WaterGoalRow({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const save = () => {
    const v = parseInt(draft, 10);
    if (!Number.isNaN(v) && v >= 200) onSave(v);
    setEditing(false);
  };
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-elevated">
        <Drop size={18} className="text-muted" />
      </div>
      <span className="flex-1 text-sm font-medium">Норма воды</span>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            inputMode="numeric"
            className="w-20 rounded-lg border border-line bg-elevated px-2 py-1 text-right text-sm outline-none tnum"
          />
          <span className="text-xs text-muted">мл</span>
          <button onClick={save} className="grid h-7 w-7 place-items-center rounded-lg bg-gold text-base active:scale-90">
            <Check size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <button onClick={() => { setDraft(String(value)); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-ink tnum active:scale-95">
          {value} мл <PencilSimple size={13} className="text-muted" />
        </button>
      )}
    </div>
  );
}

function ToggleRow({ Icon, label, value, onToggle }: { Icon: typeof Bell; label: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-elevated">
        <Icon size={18} className="text-muted" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-gold" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-base transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Row({ Icon, label, badge, last }: { Icon: typeof Bell; label: string; badge?: string; last?: boolean }) {
  return (
    <button className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevated transition-colors ${last ? "" : "border-b border-line"}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-elevated">
        <Icon size={18} className="text-muted" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">{badge}</span>}
      <CaretRight size={16} className="text-muted" />
    </button>
  );
}

function WeightInput({ onAdd }: { onAdd: (kg: number) => void }) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = parseFloat(val.replace(",", "."));
    if (!Number.isNaN(v) && v > 0) onAdd(+v.toFixed(1));
    setVal("");
  };
  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-elevated px-3">
        <Scales size={18} className="text-muted" />
        <input
          value={val}
          onChange={(e) => setVal(e.target.value.replace(/[^0-9.,]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && add()}
          inputMode="decimal"
          placeholder="Записать вес, кг"
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted tnum"
        />
      </div>
      <button onClick={add} className="rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-base active:scale-95 transition-transform">
        Записать
      </button>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 260, h = 48, pad = 4;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (p - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full" preserveAspectRatio="none">
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
