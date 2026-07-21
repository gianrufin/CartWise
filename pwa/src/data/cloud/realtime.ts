import { getSupabase } from "./client";

// Live collaboration via Supabase Realtime. Subscribes to row changes on the
// shared tables (RLS scopes events to rows the user can see) and invokes a
// callback so the store can re-pull. Returns an unsubscribe function.
//
// The Realtime connection must carry the user's JWT for RLS-filtered
// postgres_changes to be delivered, so we set it explicitly before subscribing.
export async function subscribeShared(onChange: () => void): Promise<() => void> {
  const sb = getSupabase();
  if (!sb) return () => {};

  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (token) sb.realtime.setAuth(token);

  const channel = sb
    .channel("cartwise-collab")
    .on("postgres_changes", { event: "*", schema: "public", table: "list_items" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "shopping_lists" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "list_members" }, onChange)
    .subscribe();

  return () => {
    void sb.removeChannel(channel);
  };
}
