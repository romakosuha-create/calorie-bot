import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { IS_PREVIEW } from "./telegram";
import { api } from "./api";
import { mockDay, mockWeights } from "./mock";
import type { DaySummary, Meal, WeightPoint, Workout } from "./types";

const today = () => new Date().toISOString().slice(0, 10);

/** Пересчёт итогов дня из приёмов пищи и тренировок (для preview). */
function recompute(day: DaySummary): DaySummary {
  const consumed = {
    kcal: day.meals.reduce((s, m) => s + m.kcal, 0),
    protein: day.meals.reduce((s, m) => s + m.protein, 0),
    fat: day.meals.reduce((s, m) => s + m.fat, 0),
    carb: day.meals.reduce((s, m) => s + m.carb, 0),
    fiber: day.meals.reduce((s, m) => s + m.fiber, 0),
  };
  const burned = day.workouts.reduce((s, w) => s + w.kcal_burned, 0);
  return {
    ...day,
    consumed,
    burned_kcal: burned,
    remaining_kcal: day.targets.kcal + burned - consumed.kcal,
  };
}

interface Store {
  day: DaySummary;
  weights: WeightPoint[];
  loading: boolean;
  addMeal: (m: Omit<Meal, "id">) => Promise<void>;
  deleteMeal: (id: number) => Promise<void>;
  setWater: (ml: number) => Promise<void>;
  setWaterGoal: (ml: number) => Promise<void>;
  addWorkout: (w: Omit<Workout, "id">) => Promise<void>;
  deleteWorkout: (id: number) => Promise<void>;
  addWeight: (kg: number) => Promise<void>;
  setTargets: (patch: Partial<{ kcal: number; protein: number; fat: number; carb: number }>) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore вне DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [day, setDay] = useState<DaySummary>(() => recompute(structuredClone(mockDay)));
  const [weights, setWeights] = useState<WeightPoint[]>(mockWeights);
  const [loading, setLoading] = useState(!IS_PREVIEW);

  const reload = useCallback(async () => {
    if (IS_PREVIEW) return;
    try {
      const [d, w] = await Promise.all([api.getDay(today()), api.getWeights().catch(() => [])]);
      setDay(d);
      setWeights(w);
    } catch {
      /* при ошибке оставляем текущее состояние */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Локальное обновление (preview) + опциональная синхронизация с бэкендом
  const localSet = (fn: (d: DaySummary) => DaySummary) => setDay((d) => recompute(fn(structuredClone(d))));

  const addMeal: Store["addMeal"] = async (m) => {
    if (IS_PREVIEW) {
      localSet((d) => ({ ...d, meals: [...d.meals, { ...m, id: Date.now() }] }));
      return;
    }
    await api.addMeal({ entry_date: today(), ...m });
    await reload();
  };

  const deleteMeal: Store["deleteMeal"] = async (id) => {
    if (IS_PREVIEW) {
      localSet((d) => ({ ...d, meals: d.meals.filter((x) => x.id !== id) }));
      return;
    }
    await api.deleteMeal(id);
    await reload();
  };

  const setWater: Store["setWater"] = async (ml) => {
    const v = Math.max(0, Math.round(ml));
    localSet((d) => ({ ...d, water_ml: v })); // оптимистично
    if (!IS_PREVIEW) await api.setWater({ entry_date: today(), ml: v }).catch(() => {});
  };

  const setWaterGoal: Store["setWaterGoal"] = async (ml) => {
    const v = Math.max(200, Math.round(ml));
    localSet((d) => ({ ...d, water_goal_ml: v }));
    if (!IS_PREVIEW) await api.patchMe({ water_goal_ml: v }).catch(() => {});
  };

  const addWorkout: Store["addWorkout"] = async (w) => {
    if (IS_PREVIEW) {
      localSet((d) => ({ ...d, workouts: [...d.workouts, { ...w, id: Date.now() }] }));
      return;
    }
    await api.addWorkout({ entry_date: today(), ...w });
    await reload();
  };

  const deleteWorkout: Store["deleteWorkout"] = async (id) => {
    if (IS_PREVIEW) {
      localSet((d) => ({ ...d, workouts: d.workouts.filter((x) => x.id !== id) }));
      return;
    }
    await api.deleteWorkout(id);
    await reload();
  };

  const addWeight: Store["addWeight"] = async (kg) => {
    const point = { entry_date: today(), weight_kg: kg };
    setWeights((prev) => [...prev.filter((p) => p.entry_date !== point.entry_date), point]);
    if (!IS_PREVIEW) {
      await api.setWeight(point).catch(() => {});
    }
  };

  const setTargets: Store["setTargets"] = async (patch) => {
    localSet((d) => ({ ...d, targets: { ...d.targets, ...patch } }));
    if (!IS_PREVIEW) {
      const body: Record<string, number> = {};
      if (patch.kcal != null) body.calorie_target = patch.kcal;
      if (patch.protein != null) body.protein_target = patch.protein;
      if (patch.fat != null) body.fat_target = patch.fat;
      if (patch.carb != null) body.carb_target = patch.carb;
      await api.patchMe(body).catch(() => {});
    }
  };

  const value: Store = {
    day,
    weights,
    loading,
    addMeal,
    deleteMeal,
    setWater,
    setWaterGoal,
    addWorkout,
    deleteWorkout,
    addWeight,
    setTargets,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
