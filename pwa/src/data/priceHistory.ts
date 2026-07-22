import type { ShoppingList } from "./types";

// Phase 12: price history & smart suggestions. Records the actual price paid for
// purchased items on trip completion and surfaces the last price when adding a
// similar item later. Stored locally (per device) — a durable cloud
// item_price_history table is a later enhancement.

const KEY = "cartwise.pricehist.v1";
const MAX = 400;

export interface PriceEntry {
  name: string; // normalized
  store?: string;
  unitPrice?: number;
  totalPrice: number;
  quantity: number;
  currency: string;
  at: string; // ISO
}

// Normalize an item name for matching: lowercase, trimmed, collapsed spaces.
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function load(): PriceEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PriceEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: PriceEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX)));
  } catch {
    /* non-fatal */
  }
}

// Record the purchased items of a completed trip.
export function recordPurchase(list: ShoppingList): void {
  const purchased = list.items.filter(
    (i) => i.status === "purchased" && i.actualTotalPrice != null
  );
  if (purchased.length === 0) return;
  const now = new Date().toISOString();
  const additions: PriceEntry[] = purchased.map((i) => ({
    name: normalizeName(i.name),
    store: i.store,
    unitPrice: i.actualUnitPrice ?? (i.quantity ? i.actualTotalPrice! / i.quantity : undefined),
    totalPrice: i.actualTotalPrice!,
    quantity: i.quantity,
    currency: list.currency,
    at: now,
  }));
  save([...load(), ...additions]);
}

export interface PriceSuggestion {
  unitPrice?: number;
  totalPrice: number;
  store?: string;
  at: string;
  currency: string;
}

// Most recent price for a name; prefers a matching store when given.
export function getLastPrice(name: string, store?: string): PriceSuggestion | null {
  const norm = normalizeName(name);
  if (!norm) return null;
  const matches = load().filter((e) => e.name === norm);
  if (matches.length === 0) return null;
  const preferred = store ? matches.filter((e) => e.store === store) : [];
  const pool = preferred.length > 0 ? preferred : matches;
  const latest = pool.reduce((a, b) => (a.at >= b.at ? a : b));
  return {
    unitPrice: latest.unitPrice,
    totalPrice: latest.totalPrice,
    store: latest.store,
    at: latest.at,
    currency: latest.currency,
  };
}
