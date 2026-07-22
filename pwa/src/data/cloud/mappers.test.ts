import assert from "node:assert/strict";
import test from "node:test";
import type { ListItem, ShoppingList, Trip } from "../types";
import {
  itemToRow,
  listToRow,
  rowToItem,
  rowToList,
  rowToTrip,
  tripToRow,
} from "./mappers.ts";

// Round-trip and null-handling checks for the cloud row mappers. Run with:
//   node --test --experimental-strip-types src/data/cloud/mappers.test.ts

const list: ShoppingList = {
  id: "list-1",
  name: "Weekly Groceries",
  description: undefined,
  currency: "PHP",
  budgetAmount: 3000,
  status: "active",
  createdAt: "2026-07-21T00:00:00.000Z",
  items: [],
};

const item: ListItem = {
  id: "item-1",
  listId: "list-1",
  name: "Rice",
  notes: undefined,
  quantity: 5,
  unit: "kg",
  estimatedUnitPrice: 70,
  estimatedTotalPrice: 350,
  actualUnitPrice: undefined,
  actualTotalPrice: undefined,
  category: "Pantry",
  store: "SM Supermarket",
  priority: "essential",
  status: "purchased",
  photoUrl: undefined,
};

const trip: Trip = {
  id: "trip-1",
  listId: "list-1",
  listName: "Weekly Groceries",
  currency: "PHP",
  budgetAmount: 3000,
  actualTotal: 620,
  paymentMethod: "cash",
  completedAt: "2026-07-21T00:00:00.000Z",
  purchasedCount: 2,
  unavailableCount: 1,
  skippedCount: 0,
  carriedOverCount: 0,
};

test("list round-trips through a row", () => {
  const back = rowToList(listToRow(list, "user-1"));
  assert.equal(back.id, list.id);
  assert.equal(back.name, list.name);
  assert.equal(back.budgetAmount, 3000);
  assert.equal(back.status, "active");
  assert.equal(back.description, undefined);
});

test("list maps owner and null budget correctly", () => {
  const row = listToRow({ ...list, budgetAmount: undefined }, "user-9");
  assert.equal(row.owner_user_id, "user-9");
  assert.equal(row.budget_amount, null);
  assert.equal(rowToList(row).budgetAmount, undefined);
});

test("item round-trips, undefined <-> null", () => {
  const back = rowToItem(itemToRow(item));
  assert.deepEqual(back, item);
  const row = itemToRow(item);
  assert.equal(row.actual_total_price, null);
  assert.equal(row.notes, null);
});

test("trip round-trips with payment method supplied separately", () => {
  const row = tripToRow(trip, "user-1");
  assert.equal(row.owner_user_id, "user-1");
  assert.equal(row.actual_total_amount, 620);
  const back = rowToTrip(row, "cash");
  assert.equal(back.actualTotal, 620);
  assert.equal(back.paymentMethod, "cash");
  assert.equal(back.purchasedCount, 2);
});

test("numeric strings from postgres coerce to numbers", () => {
  const row = { ...itemToRow(item), quantity: "5" as unknown as number, estimated_total_price: "350" as unknown as number };
  const back = rowToItem(row);
  assert.equal(back.quantity, 5);
  assert.equal(back.estimatedTotalPrice, 350);
  assert.equal(typeof back.estimatedTotalPrice, "number");
});
