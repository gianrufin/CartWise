import type { ShoppingList, Trip } from "../types";

// Pure diff between two store snapshots → the cloud operations needed to make
// the remote match. Kept pure so the sync logic is unit-testable (diff.test.ts)
// without a live backend; the store effect feeds the result to the sync adapter.

export interface SyncOps {
  upsertLists: ShoppingList[];
  deleteListIds: string[];
  insertTrips: Trip[];
}

export function computeSyncOps(
  prev: { lists: ShoppingList[]; trips: Trip[] },
  next: { lists: ShoppingList[]; trips: Trip[] }
): SyncOps {
  const prevListById = new Map(prev.lists.map((l) => [l.id, l]));
  const nextListIds = new Set(next.lists.map((l) => l.id));

  // Added or changed lists (deep-compare via JSON — lists are small).
  const upsertLists = next.lists.filter((l) => {
    const before = prevListById.get(l.id);
    return !before || JSON.stringify(before) !== JSON.stringify(l);
  });

  // Lists that existed before but are gone now.
  const deleteListIds = prev.lists.map((l) => l.id).filter((id) => !nextListIds.has(id));

  // Trips are append-only in the app (created on completion, never edited).
  const prevTripIds = new Set(prev.trips.map((t) => t.id));
  const insertTrips = next.trips.filter((t) => !prevTripIds.has(t.id));

  return { upsertLists, deleteListIds, insertTrips };
}
