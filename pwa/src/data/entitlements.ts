import type { User } from "./authContext";

// Subscription entitlements (Phase 8). Subscription controls what FEATURES a
// user can access; list permissions (Phase 4–5) control what they can DO in a
// list. Premium state comes from the user's subscription_status.

export function isPremium(user: User | null): boolean {
  return user != null && (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing");
}

// Free-tier limits (blueprint). Premium raises/removes these.
export const FREE_LIMITS = {
  activeSharedLists: 1,
  collaboratorsPerList: 1,
  tripHistoryDays: 60,
};

// Premium-gated features, for consistent upsell copy.
export const PREMIUM_FEATURES: Record<string, string> = {
  export: "Export your spending to CSV",
  advancedReports: "Store & payment-method breakdowns and date ranges",
  privateShareReports: "Full spending history beyond 60 days",
  moreCollaborators: "Invite more than one collaborator",
  photos: "Attach photos to items",
};
