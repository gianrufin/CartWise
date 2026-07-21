import { useEffect, useState } from "react";

// Quick Tally — a persistent running calculator for stacking grocery prices.
// Item names are optional; the point is fast price entry with a live total.
// State persists to localStorage so the tally survives reloads and app restarts.

export interface TallyEntry {
  id: string;
  amount: number;
  name?: string;
}

const STORAGE_KEY = "cartwise.tally.v1";

function load(): TallyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is TallyEntry => e && typeof e.amount === "number"
    );
  } catch {
    return [];
  }
}

export function useTally() {
  const [entries, setEntries] = useState<TallyEntry[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Non-fatal: the tally just won't persist if storage is unavailable.
    }
  }, [entries]);

  const add = (amount: number, name?: string) => {
    const trimmed = name?.trim();
    setEntries((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount,
        name: trimmed ? trimmed : undefined,
      },
    ]);
  };

  const remove = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const clear = () => setEntries([]);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  return { entries, add, remove, clear, total };
}
