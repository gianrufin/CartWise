import assert from "node:assert/strict";
import test from "node:test";
import type { Trip } from "../data/types";
import { filterByRange, spendingByList, spendingByPaymentMethod, summarize } from "./reports.ts";
import { tripsToCsv } from "./csv.ts";

// Run with: node --test --experimental-strip-types src/utils/reports.test.ts

const trip = (over: Partial<Trip>): Trip => ({
  id: over.id ?? "t",
  listId: over.listId ?? "l1",
  listName: over.listName ?? "Groceries",
  currency: "PHP",
  budgetAmount: over.budgetAmount ?? 1000,
  actualTotal: over.actualTotal ?? 500,
  paymentMethod: over.paymentMethod ?? "cash",
  completedAt: over.completedAt ?? "2026-07-10T00:00:00.000Z",
  purchasedCount: 1,
  unavailableCount: 0,
  skippedCount: 0,
  carriedOverCount: 0,
  ...over,
});

test("summarize totals, average, and over/under budget", () => {
  const s = summarize([trip({ actualTotal: 400, budgetAmount: 1000 }), trip({ actualTotal: 600, budgetAmount: 1000 })]);
  assert.equal(s.total, 1000);
  assert.equal(s.tripCount, 2);
  assert.equal(s.avgPerTrip, 500);
  assert.equal(s.budgetTotal, 2000);
  assert.equal(s.overUnder, 1000); // under budget
});

test("spendingByList groups + sorts by total", () => {
  const b = spendingByList([
    trip({ listId: "a", listName: "A", actualTotal: 100 }),
    trip({ listId: "b", listName: "B", actualTotal: 300 }),
    trip({ listId: "a", listName: "A", actualTotal: 50 }),
  ]);
  assert.equal(b[0].label, "B");
  assert.equal(b[0].total, 300);
  assert.equal(b[1].label, "A");
  assert.equal(b[1].total, 150);
  assert.equal(b[1].count, 2);
});

test("spendingByPaymentMethod uses friendly labels", () => {
  const b = spendingByPaymentMethod([trip({ paymentMethod: "gcash", actualTotal: 200 })]);
  assert.equal(b[0].label, "GCash");
});

test("filterByRange 30d keeps recent, drops old", () => {
  const now = new Date("2026-07-22T00:00:00.000Z");
  const trips = [
    trip({ id: "recent", completedAt: "2026-07-20T00:00:00.000Z" }),
    trip({ id: "old", completedAt: "2026-05-01T00:00:00.000Z" }),
  ];
  const r = filterByRange(trips, "30d", now);
  assert.equal(r.length, 1);
  assert.equal(r[0].id, "recent");
});

test("tripsToCsv escapes commas and has a header", () => {
  const csv = tripsToCsv([trip({ listName: "Weekly, Big", actualTotal: 620 })]);
  const lines = csv.split("\r\n");
  assert.match(lines[0], /^Date,List,/);
  assert.match(lines[1], /"Weekly, Big"/);
  assert.match(lines[1], /620/);
});
