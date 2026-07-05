import { getInitData } from "./telegram";
import type { DaySummary, Food, WeightPoint } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `tma ${getInitData()}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export interface Me {
  tg_id: number;
  name: string | null;
  onboarded: boolean;
  calorie_target: number | null;
}

/** Реальные вызовы бэкенда (подключаются, когда аппка открыта в Telegram). */
export const api = {
  getMe: () => request<Me>("/api/me"),
  onboarding: (body: unknown) =>
    request<Me>("/api/onboarding", { method: "POST", body: JSON.stringify(body) }),
  getDay: (date: string) => request<DaySummary>(`/api/day/${date}`),
  addMeal: (body: unknown) =>
    request("/api/meals", { method: "POST", body: JSON.stringify(body) }),
  deleteMeal: (id: number) => request(`/api/meals/${id}`, { method: "DELETE" }),
  searchFoods: (q: string) => request<Food[]>(`/api/foods/search?q=${encodeURIComponent(q)}`),
  barcode: (code: string) => request<Food>(`/api/foods/barcode/${code}`),
  patchMe: (body: unknown) =>
    request<Me>("/api/me", { method: "PATCH", body: JSON.stringify(body) }),
  setWater: (body: unknown) =>
    request("/api/water", { method: "POST", body: JSON.stringify(body) }),
  addWorkout: (body: unknown) =>
    request("/api/workouts", { method: "POST", body: JSON.stringify(body) }),
  deleteWorkout: (id: number) => request(`/api/workouts/${id}`, { method: "DELETE" }),
  setWeight: (body: unknown) =>
    request("/api/weight", { method: "POST", body: JSON.stringify(body) }),
  getWeights: () => request<WeightPoint[]>("/api/weight"),
};
