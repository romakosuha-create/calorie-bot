export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: number;
  meal_type: MealType;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
  fiber: number;
}

export interface Food {
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal_100: number;
  protein_100: number;
  fat_100: number;
  carb_100: number;
  fiber_100: number;
  source: string;
}

export interface Workout {
  id: number;
  type: string;
  duration_min: number;
  kcal_burned: number;
}

export interface Macro {
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
  fiber: number;
}

export interface DaySummary {
  entry_date: string;
  targets: Macro;
  consumed: Macro;
  burned_kcal: number;
  remaining_kcal: number;
  meals: Meal[];
}
