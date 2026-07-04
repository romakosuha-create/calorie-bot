/** Клиентский расчёт нормы (зеркало backend/app/services/nutrition.py). */

export type Gender = "male" | "female";
export type GoalId = "lose" | "maintain" | "gain";
export type ActivityId = "sedentary" | "light" | "moderate" | "active" | "very_active";

export const ACTIVITIES: { id: ActivityId; factor: number; label: string; desc: string }[] = [
  { id: "sedentary", factor: 1.2, label: "Минимальная", desc: "Сидячий образ жизни" },
  { id: "light", factor: 1.375, label: "Лёгкая", desc: "1–3 тренировки в неделю" },
  { id: "moderate", factor: 1.55, label: "Умеренная", desc: "3–5 тренировок в неделю" },
  { id: "active", factor: 1.725, label: "Высокая", desc: "6–7 тренировок в неделю" },
  { id: "very_active", factor: 1.9, label: "Очень высокая", desc: "Спорт + физическая работа" },
];

export const GOALS: { id: GoalId; factor: number; label: string; desc: string }[] = [
  { id: "lose", factor: 0.82, label: "Похудеть", desc: "Дефицит калорий" },
  { id: "maintain", factor: 1.0, label: "Поддерживать", desc: "Держать текущий вес" },
  { id: "gain", factor: 1.12, label: "Набрать", desc: "Профицит калорий" },
];

const MACRO_SPLIT = { protein: 0.3, fat: 0.3, carb: 0.4 };
const KCAL_PER_G = { protein: 4, fat: 9, carb: 4 };

export interface Anketa {
  gender: Gender;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity: ActivityId;
  goal: GoalId;
}

export function calcTargets(a: Anketa) {
  const bmr =
    10 * a.weight_kg + 6.25 * a.height_cm - 5 * a.age + (a.gender === "male" ? 5 : -161);
  const factor = ACTIVITIES.find((x) => x.id === a.activity)!.factor;
  const goalFactor = GOALS.find((x) => x.id === a.goal)!.factor;
  const kcal = Math.round(bmr * factor * goalFactor);

  return {
    kcal,
    protein: Math.round((kcal * MACRO_SPLIT.protein) / KCAL_PER_G.protein),
    fat: Math.round((kcal * MACRO_SPLIT.fat) / KCAL_PER_G.fat),
    carb: Math.round((kcal * MACRO_SPLIT.carb) / KCAL_PER_G.carb),
  };
}
