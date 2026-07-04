import { useState } from "react";
import {
  GenderMale,
  GenderFemale,
  Minus,
  Plus,
  Check,
  CaretLeft,
  Sparkle,
} from "@phosphor-icons/react";
import {
  ACTIVITIES,
  GOALS,
  calcTargets,
  type ActivityId,
  type Anketa,
  type Gender,
  type GoalId,
} from "../lib/nutrition";

const STEPS = 6;

interface OnboardingProps {
  onDone: (a: Anketa) => void;
}

export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(78);
  const [activity, setActivity] = useState<ActivityId>("moderate");
  const [goal, setGoal] = useState<GoalId>("maintain");

  const anketa: Anketa = { gender, age, height_cm: height, weight_kg: weight, activity, goal };
  const targets = calcTargets(anketa);

  const next = () => (step < STEPS - 1 ? setStep(step + 1) : onDone(anketa));
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 pb-6 pt-6">
      {/* Прогресс */}
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={back} className="grid h-8 w-8 place-items-center rounded-lg border border-line active:scale-95">
            <CaretLeft size={16} />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-line"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {step === 0 && (
          <Step title="Ваш пол" subtitle="Для точного расчёта нормы">
            <div className="grid grid-cols-2 gap-3">
              <BigCard active={gender === "male"} onClick={() => setGender("male")}>
                <GenderMale size={30} weight="fill" className={gender === "male" ? "text-gold" : "text-muted"} />
                <span className="mt-2 font-semibold">Мужской</span>
              </BigCard>
              <BigCard active={gender === "female"} onClick={() => setGender("female")}>
                <GenderFemale size={30} weight="fill" className={gender === "female" ? "text-gold" : "text-muted"} />
                <span className="mt-2 font-semibold">Женский</span>
              </BigCard>
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="Сколько вам лет?">
            <Stepper value={age} min={12} max={100} step={1} unit="лет" onChange={setAge} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Ваш рост">
            <Stepper value={height} min={120} max={230} step={1} unit="см" onChange={setHeight} />
          </Step>
        )}

        {step === 3 && (
          <Step title="Ваш вес">
            <Stepper value={weight} min={35} max={250} step={1} unit="кг" onChange={setWeight} />
          </Step>
        )}

        {step === 4 && (
          <Step title="Уровень активности">
            <div className="space-y-2.5">
              {ACTIVITIES.map((a) => (
                <ListRow key={a.id} active={activity === a.id} onClick={() => setActivity(a.id)}
                  label={a.label} desc={a.desc} />
              ))}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Ваша цель">
            <div className="space-y-2.5">
              {GOALS.map((g) => (
                <ListRow key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}
                  label={g.label} desc={g.desc} />
              ))}
            </div>

            {/* Живой расчёт нормы */}
            <div className="mt-5 rounded-2xl border border-line bg-surface p-5 ring-top-gold">
              <div className="mb-3 flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-gold" />
                <p className="text-sm font-semibold">Ваша дневная норма</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tnum">{targets.kcal}</span>
                <span className="text-base font-semibold text-muted">ккал</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Macro label="Белки" value={targets.protein} color="var(--color-protein)" />
                <Macro label="Жиры" value={targets.fat} color="var(--color-fat)" />
                <Macro label="Углеводы" value={targets.carb} color="var(--color-carb)" />
              </div>
            </div>
          </Step>
        )}
      </div>

      <button
        onClick={next}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-base active:scale-[0.98] transition-transform"
      >
        {step === STEPS - 1 ? (
          <>
            <Check size={20} weight="bold" /> Начать
          </>
        ) : (
          "Далее"
        )}
      </button>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function BigCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all active:scale-[0.98] ${
        active ? "border-gold bg-gold-soft" : "border-line bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({ value, min, max, step, unit, onChange }: {
  value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
      <button onClick={dec} className="grid h-12 w-12 place-items-center rounded-xl bg-elevated active:scale-90 transition-transform">
        <Minus size={20} />
      </button>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tnum">{value}</span>
        <span className="text-base font-semibold text-muted">{unit}</span>
      </div>
      <button onClick={inc} className="grid h-12 w-12 place-items-center rounded-xl bg-elevated active:scale-90 transition-transform">
        <Plus size={20} />
      </button>
    </div>
  );
}

function ListRow({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
        active ? "border-gold bg-gold-soft" : "border-line bg-surface"
      }`}
    >
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <div className={`grid h-6 w-6 place-items-center rounded-full border-2 ${active ? "border-gold bg-gold" : "border-line"}`}>
        {active && <Check size={14} weight="bold" className="text-base" />}
      </div>
    </button>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="text-lg font-bold tnum" style={{ color }}>{value}г</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
