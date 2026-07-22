import type {
  ItemPriority,
  ItemStatus,
  ListItem,
  PaymentMethod,
  ShoppingList,
  Trip,
} from "../types";

// Pure row <-> model mappers between the app's camelCase types and the
// snake_case Postgres rows from supabase/migrations/0001_initial_schema.sql.
// Kept pure (no client) so they're trivially unit-testable — see mappers.test.ts.

const nn = <T>(v: T | null | undefined): T | undefined => (v == null ? undefined : v);
const num = (v: unknown): number | undefined =>
  v == null || v === "" ? undefined : Number(v);

/* ----------------------------------------------------------------- lists */
export interface ListRow {
  id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  currency: string;
  budget_amount: number | null;
  status: string;
  visibility?: string | null; // trigger-managed; not written by listToRow
  created_at: string;
}

export function rowToList(
  row: ListRow,
  items: ListItem[] = [],
  opts: {
    role?: import("../permissions").Role;
    currentUserId?: string;
    canViewSpending?: boolean;
  } = {}
): ShoppingList {
  const isOwner = opts.currentUserId != null && row.owner_user_id === opts.currentUserId;
  return {
    id: row.id,
    name: row.name,
    description: nn(row.description),
    currency: row.currency,
    budgetAmount: num(row.budget_amount),
    status: row.status === "archived" ? "archived" : "active",
    createdAt: row.created_at,
    items,
    ownerUserId: row.owner_user_id,
    role: opts.role,
    // Shared if it has been shared out (visibility) or the viewer isn't the owner.
    shared: (row.visibility != null && row.visibility !== "private") || (opts.currentUserId != null && !isOwner),
    canViewSpending: isOwner ? true : opts.canViewSpending ?? true,
  };
}

export function listToRow(list: ShoppingList, ownerUserId: string): ListRow {
  return {
    id: list.id,
    owner_user_id: ownerUserId,
    name: list.name,
    description: list.description ?? null,
    currency: list.currency,
    budget_amount: list.budgetAmount ?? null,
    status: list.status,
    created_at: list.createdAt,
  };
}

/* ----------------------------------------------------------------- items */
export interface ItemRow {
  id: string;
  list_id: string;
  name: string;
  notes: string | null;
  quantity: number;
  unit: string | null;
  estimated_unit_price: number | null;
  estimated_total_price: number | null;
  actual_unit_price: number | null;
  actual_total_price: number | null;
  category: string | null;
  store: string | null;
  priority: string;
  status: string;
  photo_url: string | null;
}

export function rowToItem(row: ItemRow): ListItem {
  return {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    notes: nn(row.notes),
    quantity: Number(row.quantity),
    unit: nn(row.unit),
    estimatedUnitPrice: num(row.estimated_unit_price),
    estimatedTotalPrice: num(row.estimated_total_price),
    actualUnitPrice: num(row.actual_unit_price),
    actualTotalPrice: num(row.actual_total_price),
    category: nn(row.category),
    store: nn(row.store),
    priority: row.priority as ItemPriority,
    status: row.status as ItemStatus,
    photoUrl: nn(row.photo_url),
  };
}

export function itemToRow(item: ListItem): ItemRow {
  return {
    id: item.id,
    list_id: item.listId,
    name: item.name,
    notes: item.notes ?? null,
    quantity: item.quantity,
    unit: item.unit ?? null,
    estimated_unit_price: item.estimatedUnitPrice ?? null,
    estimated_total_price: item.estimatedTotalPrice ?? null,
    actual_unit_price: item.actualUnitPrice ?? null,
    actual_total_price: item.actualTotalPrice ?? null,
    category: item.category ?? null,
    store: item.store ?? null,
    priority: item.priority,
    status: item.status,
    photo_url: item.photoUrl ?? null,
  };
}

/* ----------------------------------------------------------------- trips */
export interface TripRow {
  id: string;
  list_id: string | null;
  owner_user_id: string;
  list_name: string;
  budget_amount: number | null;
  actual_total_amount: number;
  currency: string;
  purchased_count: number;
  unavailable_count: number;
  skipped_count: number;
  carried_over_count: number;
  completed_at: string | null;
}

export function rowToTrip(row: TripRow, paymentMethod: PaymentMethod): Trip {
  return {
    id: row.id,
    listId: row.list_id ?? "",
    listName: row.list_name,
    currency: row.currency,
    budgetAmount: num(row.budget_amount),
    actualTotal: Number(row.actual_total_amount),
    paymentMethod,
    completedAt: row.completed_at ?? new Date().toISOString(),
    purchasedCount: row.purchased_count,
    unavailableCount: row.unavailable_count,
    skippedCount: row.skipped_count,
    carriedOverCount: row.carried_over_count,
  };
}

export function tripToRow(trip: Trip, ownerUserId: string): TripRow {
  return {
    id: trip.id,
    list_id: trip.listId || null,
    owner_user_id: ownerUserId,
    list_name: trip.listName,
    budget_amount: trip.budgetAmount ?? null,
    actual_total_amount: trip.actualTotal,
    currency: trip.currency,
    purchased_count: trip.purchasedCount,
    unavailable_count: trip.unavailableCount,
    skipped_count: trip.skippedCount,
    carried_over_count: trip.carriedOverCount,
    completed_at: trip.completedAt,
  };
}
