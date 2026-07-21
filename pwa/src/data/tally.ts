import { useEffect, useState } from "react";

// Quick Tally — a persistent running calculator for stacking grocery prices.
// Item names are optional; the point is fast price entry with a live total and
// an optional budget. State persists to localStorage so the tally survives
// reloads and app restarts.

export interface TallyEntry {
  id: string;
  amount: number;
  name?: string;
}

interface TallyData {
  entries: TallyEntry[];
  budget?: number;
}

const STORAGE_KEY = "cartwise.tally.v1";

function load(): TallyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw);
    // Legacy format was a bare entries array — migrate it.
    if (Array.isArray(parsed)) {
      return { entries: parsed.filter((e) => e && typeof e.amount === "number") };
    }
    return {
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.filter((e: unknown): e is TallyEntry =>
            !!e && typeof (e as TallyEntry).amount === "number"
          )
        : [],
      budget: typeof parsed.budget === "number" ? parsed.budget : undefined,
    };
  } catch {
    return { entries: [] };
  }
}

export function useTally() {
  const [data, setData] = useState<TallyData>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Non-fatal: the tally just won't persist if storage is unavailable.
    }
  }, [data]);

  const add = (amount: number, name?: string) => {
    const trimmed = name?.trim();
    setData((d) => ({
      ...d,
      entries: [
        ...d.entries,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          amount,
          name: trimmed ? trimmed : undefined,
        },
      ],
    }));
  };

  const remove = (id: string) =>
    setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }));

  const clear = () => setData((d) => ({ ...d, entries: [] }));

  const setBudget = (budget: number | undefined) =>
    setData((d) => ({ ...d, budget }));

  const total = data.entries.reduce((sum, e) => sum + e.amount, 0);

  return { entries: data.entries, budget: data.budget, add, remove, clear, setBudget, total };
}
