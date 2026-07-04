import type { DaySummary, Food, Meal, Workout } from "./types";

/** Реалистичные mock-данные для локального preview (не Jane-Doe). */
export const mockMeals: Meal[] = [
  { id: 1, meal_type: "breakfast", name: "Овсянка на молоке с бананом", grams: 280, kcal: 372, protein: 13, fat: 8, carb: 62, fiber: 6 },
  { id: 2, meal_type: "lunch", name: "Гречка с куриной грудкой", grams: 320, kcal: 468, protein: 42, fat: 9, carb: 54, fiber: 8 },
  { id: 3, meal_type: "snack", name: "Творог 5% с мёдом", grams: 180, kcal: 214, protein: 28, fat: 9, carb: 12, fiber: 0 },
];

export const mockWorkouts: Workout[] = [
  { id: 1, type: "Силовая тренировка", duration_min: 55, kcal_burned: 340 },
];

export const mockDay: DaySummary = {
  entry_date: new Date().toISOString().slice(0, 10),
  targets: { kcal: 2150, protein: 161, fat: 72, carb: 215, fiber: 30 },
  consumed: {
    kcal: mockMeals.reduce((s, m) => s + m.kcal, 0),
    protein: mockMeals.reduce((s, m) => s + m.protein, 0),
    fat: mockMeals.reduce((s, m) => s + m.fat, 0),
    carb: mockMeals.reduce((s, m) => s + m.carb, 0),
    fiber: mockMeals.reduce((s, m) => s + m.fiber, 0),
  },
  burned_kcal: 340,
  get remaining_kcal() {
    return this.targets.kcal + this.burned_kcal - this.consumed.kcal;
  },
  meals: mockMeals,
};

/** Калории по дням недели для экрана «Статистика». */
export const mockWeek = [
  { day: "Пн", kcal: 2040 },
  { day: "Вт", kcal: 2260 },
  { day: "Ср", kcal: 1890 },
  { day: "Чт", kcal: 2150 },
  { day: "Пт", kcal: 1054 },
  { day: "Сб", kcal: 0 },
  { day: "Вс", kcal: 0 },
];

/** Локальная база продуктов для preview-поиска (в Telegram — Open Food Facts). */
export const mockFoods: Food[] = [
  { name: "Куриная грудка, отварная", brand: null, barcode: null, kcal_100: 137, protein_100: 29, fat_100: 1.8, carb_100: 0, fiber_100: 0, source: "mock" },
  { name: "Гречка варёная", brand: null, barcode: null, kcal_100: 92, protein_100: 3.4, fat_100: 0.6, carb_100: 19, fiber_100: 2.7, source: "mock" },
  { name: "Овсянка на воде", brand: null, barcode: null, kcal_100: 88, protein_100: 3, fat_100: 1.7, carb_100: 15, fiber_100: 1.7, source: "mock" },
  { name: "Творог 5%", brand: "Простоквашино", barcode: null, kcal_100: 121, protein_100: 17, fat_100: 5, carb_100: 3, fiber_100: 0, source: "mock" },
  { name: "Банан", brand: null, barcode: null, kcal_100: 96, protein_100: 1.5, fat_100: 0.2, carb_100: 21, fiber_100: 1.7, source: "mock" },
  { name: "Яйцо куриное", brand: null, barcode: null, kcal_100: 157, protein_100: 12.7, fat_100: 11.5, carb_100: 0.7, fiber_100: 0, source: "mock" },
  { name: "Рис белый варёный", brand: null, barcode: null, kcal_100: 116, protein_100: 2.2, fat_100: 0.5, carb_100: 25, fiber_100: 0.4, source: "mock" },
  { name: "Лосось запечённый", brand: null, barcode: null, kcal_100: 206, protein_100: 22, fat_100: 13, carb_100: 0, fiber_100: 0, source: "mock" },
];
