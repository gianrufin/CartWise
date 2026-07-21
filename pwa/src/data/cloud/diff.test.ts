import assert from "node:assert/strict";
import test from "node:test";
import type { ShoppingList, Trip } from "../types";
import { computeSyncOps } from "./diff.ts";

// Run with: node --test --experimental-strip-types src/data/cloud/diff.test.ts

const list = (id: string, name: string, items: ShoppingList["items"] = []): ShoppingList => ({
  id,
  name,
  currency: "PHP",
  budgetAmount: 1000,
  status: "active",
  createdAt: "2026-07-21T00:00:00.000Z",
  items,
});

const trip = (id: string): Trip => ({
  id,
  listId: "l1",
  listName: "L",
  currency: "PHP",
  actualTotal: 100,
  paymentMethod: "cash",
  completedAt: "2026-07-21T00:00:00.000Z",
  purchasedCount: 1,
  unavailableCount: 0,
  skippedCount: 0,
  carriedOverCount: 0,
});

test("new list is upserted", () => {
  const ops = computeSyncOps({ lists: [], trips: [] }, { lists: [list("l1", "A")], trips: [] });
  assert.equal(ops.upsertLists.length, 1);
  assert.equal(ops.upsertLists[0].id, "l1");
  assert.equal(ops.deleteListIds.length, 0);
});

test("unchanged list produces no ops", () => {
  const a = list("l1", "A");
  const ops = computeSyncOps({ lists: [a], trips: [] }, { lists: [a], trips: [] });
  assert.equal(ops.upsertLists.length, 0);
  assert.equal(ops.deleteListIds.length, 0);
});

test("changed list (renamed / new item) is upserted", () => {
  const before = list("l1", "A");
  const after = list("l1", "A renamed");
  const ops = computeSyncOps({ lists: [before], trips: [] }, { lists: [after], trips: [] });
  assert.equal(ops.upsertLists.length, 1);
  assert.equal(ops.upsertLists[0].name, "A renamed");
});

test("removed list is deleted", () => {
  const ops = computeSyncOps({ lists: [list("l1", "A")], trips: [] }, { lists: [], trips: [] });
  assert.deepEqual(ops.deleteListIds, ["l1"]);
  assert.equal(ops.upsertLists.length, 0);
});

test("new trip is inserted, existing trip is not", () => {
  const ops = computeSyncOps(
    { lists: [], trips: [trip("t1")] },
    { lists: [], trips: [trip("t2"), trip("t1")] }
  );
  assert.equal(ops.insertTrips.length, 1);
  assert.equal(ops.insertTrips[0].id, "t2");
});
