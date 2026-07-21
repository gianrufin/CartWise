import assert from "node:assert/strict";
import test from "node:test";
import type { ListItem, ShoppingList, Trip } from "../types";
import { computeSyncOps } from "./diff.ts";

// Run with: node --test --experimental-strip-types src/data/cloud/diff.test.ts

const item = (id: string, listId: string, over: Partial<ListItem> = {}): ListItem => ({
  id,
  listId,
  name: id,
  quantity: 1,
  priority: "normal",
  status: "pending",
  ...over,
});

const list = (id: string, name: string, items: ListItem[] = []): ShoppingList => ({
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

test("new list + items upsert list meta and items", () => {
  const ops = computeSyncOps(
    { lists: [], trips: [] },
    { lists: [list("l1", "A", [item("i1", "l1")])], trips: [] }
  );
  assert.equal(ops.upsertListMeta.length, 1);
  assert.equal(ops.upsertItems.length, 1);
  assert.equal(ops.upsertItems[0].id, "i1");
});

test("changing one item pushes only that item, not list meta", () => {
  const before = list("l1", "A", [item("i1", "l1"), item("i2", "l1")]);
  const after = list("l1", "A", [item("i1", "l1", { status: "purchased" }), item("i2", "l1")]);
  const ops = computeSyncOps({ lists: [before], trips: [] }, { lists: [after], trips: [] });
  assert.equal(ops.upsertListMeta.length, 0, "list meta unchanged");
  assert.equal(ops.upsertItems.length, 1, "only the edited item");
  assert.equal(ops.upsertItems[0].id, "i1");
  assert.equal(ops.upsertItems[0].status, "purchased");
});

test("renaming the list pushes meta but not unchanged items", () => {
  const before = list("l1", "A", [item("i1", "l1")]);
  const after = list("l1", "A renamed", [item("i1", "l1")]);
  const ops = computeSyncOps({ lists: [before], trips: [] }, { lists: [after], trips: [] });
  assert.equal(ops.upsertListMeta.length, 1);
  assert.equal(ops.upsertItems.length, 0);
});

test("removing an item queues an item delete", () => {
  const before = list("l1", "A", [item("i1", "l1"), item("i2", "l1")]);
  const after = list("l1", "A", [item("i1", "l1")]);
  const ops = computeSyncOps({ lists: [before], trips: [] }, { lists: [after], trips: [] });
  assert.deepEqual(ops.deleteItemIds, ["i2"]);
});

test("deleting a whole list queues list delete, not per-item deletes", () => {
  const before = list("l1", "A", [item("i1", "l1")]);
  const ops = computeSyncOps({ lists: [before], trips: [] }, { lists: [], trips: [] });
  assert.deepEqual(ops.deleteListIds, ["l1"]);
  assert.equal(ops.deleteItemIds.length, 0, "list delete cascades items");
});

test("new trip is inserted once", () => {
  const ops = computeSyncOps(
    { lists: [], trips: [trip("t1")] },
    { lists: [], trips: [trip("t2"), trip("t1")] }
  );
  assert.equal(ops.insertTrips.length, 1);
  assert.equal(ops.insertTrips[0].id, "t2");
});
