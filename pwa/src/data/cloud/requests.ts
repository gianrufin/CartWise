import { getSupabase } from "./client";

// Item requests adapter (Phase 10). Request-only members submit requests;
// owners approve (creating a list item) or decline. RLS enforces who can do what.

export interface ItemRequest {
  id: string;
  listId: string;
  requestedByUserId: string;
  requestedByName?: string;
  name: string;
  notes?: string;
  quantity: number;
  estimatedPrice?: number;
  status: "pending" | "approved" | "declined" | "edited" | "cancelled";
}

export async function createRequest(input: {
  listId: string;
  requestedByUserId: string;
  requestedByName?: string;
  name: string;
  notes?: string;
  quantity: number;
  estimatedPrice?: number;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const { error } = await sb.from("item_requests").insert({
    list_id: input.listId,
    requested_by_user_id: input.requestedByUserId,
    requested_by_name: input.requestedByName ?? null,
    name: input.name.trim(),
    notes: input.notes?.trim() || null,
    quantity: input.quantity,
    estimated_price: input.estimatedPrice ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function listRequests(listId: string): Promise<ItemRequest[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("item_requests")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    listId: r.list_id as string,
    requestedByUserId: r.requested_by_user_id as string,
    requestedByName: (r.requested_by_name as string) ?? undefined,
    name: r.name as string,
    notes: (r.notes as string) ?? undefined,
    quantity: Number(r.quantity),
    estimatedPrice: r.estimated_price == null ? undefined : Number(r.estimated_price),
    status: r.status as ItemRequest["status"],
  }));
}

export async function setRequestStatus(
  requestId: string,
  status: ItemRequest["status"]
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("item_requests").update({ status }).eq("id", requestId);
  if (error) throw new Error(error.message);
}
