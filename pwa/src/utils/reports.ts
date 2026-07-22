import type { Trip } from "../data/types.ts";
import { PAYMENT_LABELS } from "../data/types.ts";

// Pure spending-report aggregations over completed trips (Phase 7).

export type DateRange = "month" | "30d" | "90d" | "all";

export const RANGE_LABELS: Record<DateRange, string> = {
  month: "This month",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export function filterByRange(trips: Trip[], range: DateRange, now = new Date()): Trip[] {
  if (range === "all") return trips;
  if (range === "month") {
    return trips.filter((t) => {
      const d = new Date(t.completedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }
  const days = range === "30d" ? 30 : 90;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return trips.filter((t) => new Date(t.completedAt).getTime() >= cutoff);
}

export interface Breakdown {
  key: string;
  label: string;
  total: number;
  count: number;
}

function group(trips: Trip[], keyOf: (t: Trip) => { key: string; label: string }): Breakdown[] {
  const map = new Map<string, Breakdown>();
  for (const t of trips) {
    const { key, label } = keyOf(t);
    const b = map.get(key) ?? { key, label, total: 0, count: 0 };
    b.total += t.actualTotal;
    b.count += 1;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export const spendingByList = (trips: Trip[]): Breakdown[] =>
  group(trips, (t) => ({ key: t.listId || t.listName, label: t.listName }));

export const spendingByPaymentMethod = (trips: Trip[]): Breakdown[] =>
  group(trips, (t) => ({ key: t.paymentMethod, label: PAYMENT_LABELS[t.paymentMethod] }));

export interface ReportSummary {
  total: number;
  tripCount: number;
  avgPerTrip: number;
  budgetTotal: number;
  overUnder: number; // budgetTotal - total (positive = under budget)
}

export function summarize(trips: Trip[]): ReportSummary {
  const total = trips.reduce((s, t) => s + t.actualTotal, 0);
  const budgetTotal = trips.reduce((s, t) => s + (t.budgetAmount ?? 0), 0);
  return {
    total,
    tripCount: trips.length,
    avgPerTrip: trips.length ? total / trips.length : 0,
    budgetTotal,
    overUnder: budgetTotal - total,
  };
}
