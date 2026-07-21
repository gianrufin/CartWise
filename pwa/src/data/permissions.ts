// Role → capability matrix for shared lists (Phase 4). Kept pure so it's
// unit-tested and shared by the UI (to gate actions) — the database enforces
// the same boundaries via RLS in supabase/migrations/0002_sharing.sql.

export type Role = "owner" | "shopper" | "contributor" | "viewer";

export type Capability =
  | "viewItems"
  | "addItems"
  | "editItems"
  | "enterPrices"
  | "markPurchased"
  | "changeBudget"
  | "completeTrip"
  | "manageMembers"
  | "deleteList";

const MATRIX: Record<Role, Capability[]> = {
  owner: [
    "viewItems",
    "addItems",
    "editItems",
    "enterPrices",
    "markPurchased",
    "changeBudget",
    "completeTrip",
    "manageMembers",
    "deleteList",
  ],
  shopper: ["viewItems", "addItems", "editItems", "enterPrices", "markPurchased", "completeTrip"],
  contributor: ["viewItems", "addItems", "editItems"],
  viewer: ["viewItems"],
};

export function roleCan(role: Role | undefined, cap: Capability): boolean {
  // Undefined role = a purely local/owned list → full control.
  if (!role) return true;
  return MATRIX[role]?.includes(cap) ?? false;
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  shopper: "Shopper",
  contributor: "Contributor",
  viewer: "Viewer",
};

// Roles an owner can assign when inviting (not owner).
export const INVITABLE_ROLES: Role[] = ["shopper", "contributor", "viewer"];
