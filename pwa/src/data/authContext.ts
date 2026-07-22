import { createContext, useContext } from "react";

// Shared auth types + context, split out so the local and (lazy-loaded) cloud
// providers can both use them without a circular import.

const STORE_PREFIX = "cartwise.store.";

export function storeKeyFor(userId: string | null): string {
  return `${STORE_PREFIX}${userId ?? "guest"}.v1`;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
  // Phase 8: 'free' | 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'
  subscriptionStatus: string;
}

export type ProfilePatch = Partial<
  Pick<User, "displayName" | "defaultCurrency" | "subscriptionStatus">
>;

export interface AuthApi {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signUp: (input: { email: string; password: string; displayName?: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  // Re-read the current user (e.g. subscription status after a PayPal payment).
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
