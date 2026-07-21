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

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  currency: string;
  budgetAmount?: number;
  items: ListItem[];
}

export interface CompletedTrip {
  id: string;
  listName: string;
  currency: string;
  budgetAmount?: number;
  actualTotal: number;
  paymentMethod: PaymentMethod;
  completedAtLabel: string;
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
