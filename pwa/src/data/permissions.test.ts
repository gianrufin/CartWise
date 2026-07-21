import assert from "node:assert/strict";
import test from "node:test";
import { roleCan } from "./permissions.ts";

// Run with: node --test --experimental-strip-types src/data/permissions.test.ts

test("viewer can only view", () => {
  assert.equal(roleCan("viewer", "viewItems"), true);
  assert.equal(roleCan("viewer", "addItems"), false);
  assert.equal(roleCan("viewer", "editItems"), false);
  assert.equal(roleCan("viewer", "enterPrices"), false);
});

test("contributor can add/edit but not prices, budget, or complete", () => {
  assert.equal(roleCan("contributor", "addItems"), true);
  assert.equal(roleCan("contributor", "editItems"), true);
  assert.equal(roleCan("contributor", "enterPrices"), false);
  assert.equal(roleCan("contributor", "changeBudget"), false);
  assert.equal(roleCan("contributor", "completeTrip"), false);
});

test("shopper can price/purchase/complete but not budget or members", () => {
  assert.equal(roleCan("shopper", "enterPrices"), true);
  assert.equal(roleCan("shopper", "markPurchased"), true);
  assert.equal(roleCan("shopper", "completeTrip"), true);
  assert.equal(roleCan("shopper", "changeBudget"), false);
  assert.equal(roleCan("shopper", "manageMembers"), false);
});

test("owner can do everything", () => {
  for (const cap of ["addItems", "changeBudget", "completeTrip", "manageMembers", "deleteList"] as const) {
    assert.equal(roleCan("owner", cap), true);
  }
});

test("undefined role (local/owned list) allows everything", () => {
  assert.equal(roleCan(undefined, "changeBudget"), true);
  assert.equal(roleCan(undefined, "deleteList"), true);
});
