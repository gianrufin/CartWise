import type { PaymentMethod, ShoppingList, Trip } from "../types";
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

// Pull every list (with items) and trip (with its payment method) for the user.
export async function pullState(userId: string): Promise<CloudState> {
  const sb = getSupabase();
  if (!sb) return { lists: [], trips: [] };

  const [listsRes, itemsRes, tripsRes, paymentsRes] = await Promise.all([
    sb.from("shopping_lists").select("*").eq("owner_user_id", userId),
    sb.from("list_items").select("*"),
    sb.from("shopping_trips").select("*").eq("owner_user_id", userId),
    sb.from("trip_payments").select("*"),
  ]);

  const itemsByList = new Map<string, ItemRow[]>();
  for (const row of (itemsRes.data ?? []) as ItemRow[]) {
    const arr = itemsByList.get(row.list_id) ?? [];
    arr.push(row);
    itemsByList.set(row.list_id, arr);
  }

  const paymentByTrip = new Map<string, PaymentMethod>();
  for (const pay of (paymentsRes.data ?? []) as { trip_id: string; payment_method: string }[]) {
    paymentByTrip.set(pay.trip_id, pay.payment_method as PaymentMethod);
  }

  const lists = ((listsRes.data ?? []) as ListRow[]).map((row) =>
    rowToList(row, (itemsByList.get(row.id) ?? []).map(rowToItem))
  );
  const trips = ((tripsRes.data ?? []) as TripRow[]).map((row) =>
    rowToTrip(row, paymentByTrip.get(row.id) ?? "cash")
  );

  return { lists, trips };
}

// Upsert a list and replace its items (simple full-replace sync for the MVP).
export async function pushList(list: ShoppingList, userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from("shopping_lists").upsert(listToRow(list, userId));
  await sb.from("list_items").delete().eq("list_id", list.id);
  if (list.items.length > 0) {
    await sb.from("list_items").insert(list.items.map(itemToRow));
  }
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
