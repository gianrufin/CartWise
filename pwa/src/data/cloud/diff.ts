import type { ListItem, ShoppingList, Trip } from "../types";

// Pure diff between two store snapshots → the cloud operations needed to make
// the remote match. Item-level granularity so concurrent collaborators don't
// clobber each other (only the rows that actually changed are pushed). Kept
// pure and unit-tested (diff.test.ts).

export interface SyncOps {
  // List rows whose metadata (name/budget/…) changed — owner-only on push.
  upsertListMeta: ShoppingList[];
  deleteListIds: string[];
  // Items added or changed, and items removed (whose list still exists).
  upsertItems: ListItem[];
  deleteItemIds: string[];
  // Trips are append-only.
  insertTrips: Trip[];
}

type Snapshot = { lists: ShoppingList[]; trips: Trip[] };

// Compare a list's metadata, ignoring its items.
function metaChanged(a: ShoppingList, b: ShoppingList): boolean {
  return (
    a.name !== b.name ||
    a.description !== b.description ||
    a.currency !== b.currency ||
    a.budgetAmount !== b.budgetAmount ||
    a.status !== b.status
  );
}

function itemsById(lists: ShoppingList[]): Map<string, ListItem> {
  const m = new Map<string, ListItem>();
  for (const l of lists) for (const it of l.items) m.set(it.id, it);
  return m;
}

export function computeSyncOps(prev: Snapshot, next: Snapshot): SyncOps {
  const prevListById = new Map(prev.lists.map((l) => [l.id, l]));
  const nextListIds = new Set(next.lists.map((l) => l.id));

  const upsertListMeta = next.lists.filter((l) => {
    const before = prevListById.get(l.id);
    return !before || metaChanged(before, l);
  });
  const deleteListIds = prev.lists.map((l) => l.id).filter((id) => !nextListIds.has(id));

  const prevItems = itemsById(prev.lists);
  const nextItems = itemsById(next.lists);

  const upsertItems: ListItem[] = [];
  for (const [id, item] of nextItems) {
    const before = prevItems.get(id);
    if (!before || JSON.stringify(before) !== JSON.stringify(item)) upsertItems.push(item);
  }

  const deleteItemIds: string[] = [];
  for (const [id, item] of prevItems) {
    // Skip items whose whole list was removed — the list delete cascades.
    if (!nextItems.has(id) && nextListIds.has(item.listId)) deleteItemIds.push(id);
  }

  const prevTripIds = new Set(prev.trips.map((t) => t.id));
  const insertTrips = next.trips.filter((t) => !prevTripIds.has(t.id));

  return { upsertListMeta, deleteListIds, upsertItems, deleteItemIds, insertTrips };
}
