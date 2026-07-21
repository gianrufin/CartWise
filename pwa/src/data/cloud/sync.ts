import type { ListItem, PaymentMethod, ShoppingList, Trip } from "../types";
import { getSupabase } from "./client";
import {
  itemToRow,
  listToRow,
  rowToItem,
  rowToList,
  rowToTrip,
  tripToRow,
  type ItemRow,
  type ListRow,
  type TripRow,
} from "./mappers";

// Cloud sync adapter. Reads/writes the Postgres tables defined in
// supabase/migrations/0001_initial_schema.sql through the RLS-scoped client.
// Only reachable when the cloud backend is configured; the local store remains
// the offline source of truth and these mirror it. Wiring the store to call
// these (with offline queueing) is the final step of Phase 3 cloud enablement.

export interface CloudState {
  lists: ShoppingList[];
  trips: Trip[];
}

// Pull every accessible list (owned + shared, RLS-scoped) with items, plus the
// user's own trips. Each list carries the caller's role for UI gating.
export async function pullState(userId: string): Promise<CloudState> {
  const sb = getSupabase();
  if (!sb) return { lists: [], trips: [] };

  // No owner filter on lists/items: RLS returns owned + shared rows.
  const [listsRes, itemsRes, membersRes, tripsRes, paymentsRes] = await Promise.all([
    sb.from("shopping_lists").select("*"),
    sb.from("list_items").select("*"),
    sb.from("list_members").select("list_id,user_id,role"),
    sb.from("shopping_trips").select("*").eq("owner_user_id", userId),
    sb.from("trip_payments").select("*"),
  ]);

  const itemsByList = new Map<string, ItemRow[]>();
  for (const row of (itemsRes.data ?? []) as ItemRow[]) {
    const arr = itemsByList.get(row.list_id) ?? [];
    arr.push(row);
    itemsByList.set(row.list_id, arr);
  }

  // Role the caller holds on each list they're a member of.
  const myRole = new Map<string, import("../permissions").Role>();
  for (const m of (membersRes.data ?? []) as { list_id: string; user_id: string; role: string }[]) {
    if (m.user_id === userId) myRole.set(m.list_id, m.role as import("../permissions").Role);
  }

  const paymentByTrip = new Map<string, PaymentMethod>();
  for (const pay of (paymentsRes.data ?? []) as { trip_id: string; payment_method: string }[]) {
    paymentByTrip.set(pay.trip_id, pay.payment_method as PaymentMethod);
  }

  const lists = ((listsRes.data ?? []) as ListRow[]).map((row) => {
    const role: import("../permissions").Role =
      row.owner_user_id === userId ? "owner" : myRole.get(row.id) ?? "viewer";
    return rowToList(row, (itemsByList.get(row.id) ?? []).map(rowToItem), {
      role,
      currentUserId: userId,
    });
  });
  const trips = ((tripsRes.data ?? []) as TripRow[]).map((row) =>
    rowToTrip(row, paymentByTrip.get(row.id) ?? "cash")
  );

  return { lists, trips };
}

// Full-replace push of a list (used only for guest→cloud migration, where the
// account starts empty so there's nothing to clobber).
export async function pushList(list: ShoppingList, userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const isOwner = !list.ownerUserId || list.ownerUserId === userId;
  if (isOwner) {
    await sb.from("shopping_lists").upsert(listToRow(list, userId));
  }
  await sb.from("list_items").delete().eq("list_id", list.id);
  if (list.items.length > 0) {
    await sb.from("list_items").insert(list.items.map(itemToRow));
  }
}

// --- Granular delta sync (per-item), used for live editing ---

// Upsert a list's metadata row only. Owner-only; members can't change it.
export async function pushListMeta(list: ShoppingList, userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const isOwner = !list.ownerUserId || list.ownerUserId === userId;
  if (!isOwner) return;
  await sb.from("shopping_lists").upsert(listToRow(list, userId));
}

export async function upsertItems(items: ListItem[]): Promise<void> {
  const sb = getSupabase();
  if (!sb || items.length === 0) return;
  await sb.from("list_items").upsert(items.map(itemToRow));
}

export async function deleteItems(ids: string[]): Promise<void> {
  const sb = getSupabase();
  if (!sb || ids.length === 0) return;
  await sb.from("list_items").delete().in("id", ids);
}

export async function deleteList(listId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  // list_items cascade via FK on delete.
  await sb.from("shopping_lists").delete().eq("id", listId);
}

// Record a completed trip and its single payment row.
export async function pushTrip(
  trip: Trip,
  paymentMethod: PaymentMethod,
  userId: string
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from("shopping_trips").upsert(tripToRow(trip, userId));
  await sb.from("trip_payments").insert({
    trip_id: trip.id,
    payment_method: paymentMethod,
    amount: trip.actualTotal,
  });
}
