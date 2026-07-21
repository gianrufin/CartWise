// Phase 0 UI models. Field names track docs/backend/schema-plan.sql so the
// IndexedDB store (Phase 1) and Supabase tables (Phase 3) line up with the UI.

export type ItemStatus =
  | "pending"
  | "purchased"
  | "unavailable"
  | "skipped"
  | "carried_over";

export type ItemPriority = "essential" | "normal" | "optional";

export type PaymentMethod =
  | "cash"
  | "gcash"
  | "maya"
  | "debit_card"
  | "credit_card"
  | "bank_transfer"
  | "voucher"
  | "other";

export interface ListItem {
  id: string;
  listId: string;
  name: string;
  notes?: string;
  quantity: number;
  unit?: string;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  actualUnitPrice?: number;
  actualTotalPrice?: number;
  category?: string;
  store?: string;
  priority: ItemPriority;
  status: ItemStatus;
}

export type ListStatus = "active" | "archived";

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  currency: string;
  budgetAmount?: number;
  status: ListStatus;
  createdAt: string; // ISO
  items: ListItem[];
  // Cloud/sharing (Phase 4): undefined for purely local/owned lists.
  ownerUserId?: string;
  role?: import("./permissions").Role;
  shared?: boolean;
}

export interface Member {
  userId: string;
  role: import("./permissions").Role;
  displayName?: string;
  email?: string;
}

// A completed shopping trip — the unit of spending history.
export interface Trip {
  id: string;
  listId: string;
  listName: string;
  currency: string;
  budgetAmount?: number;
  actualTotal: number;
  paymentMethod: PaymentMethod;
  completedAt: string; // ISO
  purchasedCount: number;
  unavailableCount: number;
  skippedCount: number;
  carriedOverCount: number;
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: "Pending",
  purchased: "Purchased",
  unavailable: "Unavailable",
  skipped: "Skipped",
  carried_over: "Carried over",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
  debit_card: "Debit card",
  credit_card: "Credit card",
  bank_transfer: "Bank transfer",
  voucher: "Voucher",
  other: "Other",
};

export const isResolved = (item: ListItem): boolean => item.status !== "pending";

// Only purchased items count as actual spending.
export const actualTotal = (items: ListItem[]): number =>
  items
    .filter((i) => i.status === "purchased")
    .reduce((sum, i) => sum + (i.actualTotalPrice ?? 0), 0);

export const estimatedTotal = (items: ListItem[]): number =>
  items
    .filter((i) => i.status !== "skipped" && i.status !== "unavailable")
    .reduce((sum, i) => sum + (i.estimatedTotalPrice ?? 0), 0);

export const resolvedCount = (items: ListItem[]): number =>
  items.filter(isResolved).length;

export const unresolvedCount = (items: ListItem[]): number =>
  items.filter((i) => !isResolved(i)).length;

// Derive the price the user didn't type from the one they did.
// Returns whichever fields should be filled/normalised for an item.
export function derivePrices(input: {
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}): { unitPrice?: number; totalPrice?: number; mismatch: boolean } {
  const { quantity, unitPrice, totalPrice } = input;
  const hasUnit = unitPrice != null && !Number.isNaN(unitPrice);
  const hasTotal = totalPrice != null && !Number.isNaN(totalPrice);
  const qty = quantity > 0 ? quantity : 1;

  if (hasUnit && hasTotal) {
    // Both entered — flag a mismatch if they don't reconcile (small epsilon).
    const expected = unitPrice! * qty;
    const mismatch = Math.abs(expected - totalPrice!) > 0.01;
    return { unitPrice, totalPrice, mismatch };
  }
  if (hasUnit) return { unitPrice, totalPrice: round2(unitPrice! * qty), mismatch: false };
  if (hasTotal) return { unitPrice: round2(totalPrice! / qty), totalPrice, mismatch: false };
  return { unitPrice: undefined, totalPrice: undefined, mismatch: false };
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
