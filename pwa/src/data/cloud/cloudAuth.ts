import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "../auth";
import { getSupabase } from "./client";

// Supabase Auth helpers, shaped to match the local auth API (auth.tsx) so the
// AuthProvider can delegate to Supabase when the cloud backend is configured.
// Credentials go straight to Supabase Auth — the app never stores passwords.
// Wiring AuthProvider to prefer these (with onAuthStateChange driving `user`)
// is the final Phase 3 cloud step; kept isolated so the verified local path is
// untouched until then.

function toUser(u: SupabaseUser): User {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: u.id,
    email: u.email ?? "",
    displayName:
      (meta.display_name as string) || (u.email ? u.email.split("@")[0] : "You"),
    defaultCurrency: (meta.default_currency as string) || "PHP",
  };
}

export async function cloudSignUp(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<User> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { display_name: input.displayName?.trim() || undefined } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Check your email to confirm your account.");
  return toUser(data.user);
}

export async function cloudSignIn(input: {
  email: string;
  password: string;
}): Promise<User> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const { data, error } = await sb.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) throw new Error(error.message);
  return toUser(data.user);
}

export async function cloudSignOut(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function cloudUpdateProfile(patch: {
  displayName?: string;
  defaultCurrency?: string;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  // Keep auth metadata and the users_profile row in step.
  await sb.auth.updateUser({
    data: {
      ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
      ...(patch.defaultCurrency !== undefined ? { default_currency: patch.defaultCurrency } : {}),
    },
  });
  const { data } = await sb.auth.getUser();
  if (data.user) {
    await sb.from("users_profile").update({
      ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
      ...(patch.defaultCurrency !== undefined ? { default_currency: patch.defaultCurrency } : {}),
    }).eq("id", data.user.id);
  }
}

// Returns whether a live session exists right now (used to detect the
// "email confirmation required" case after signUp).
export async function cloudHasSession(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb.auth.getSession();
  return Boolean(data.session);
}

export async function cloudCurrentUser(): Promise<User | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ? toUser(data.user) : null;
}

// Subscribe to auth changes; returns an unsubscribe function.
export function onCloudAuthChange(cb: (user: User | null) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? toUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}
