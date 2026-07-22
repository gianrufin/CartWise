import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthApi, type ProfilePatch, type User } from "../authContext";
import {
  cloudCurrentUser,
  cloudHasSession,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  cloudUpdateProfile,
  onCloudAuthChange,
} from "./cloudAuth";

// Supabase-backed auth. Lazy-loaded (default export) so @supabase/supabase-js
// only ships to clients where the cloud backend is configured; the local
// guest/offline build never pulls it in.
export default function CloudAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cloudCurrentUser()
      .then((u) => active && setUser(u))
      .finally(() => active && setLoading(false));
    const unsub = onCloudAuthChange((u) => setUser(u));
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const signUp = useCallback(
    async (input: { email: string; password: string; displayName?: string }) => {
      await cloudSignUp(input);
      // With email confirmation on, no session exists yet.
      if (!(await cloudHasSession())) {
        throw new Error("Account created — check your email to confirm, then sign in.");
      }
    },
    []
  );

  const signIn = useCallback(async (input: { email: string; password: string }) => {
    await cloudSignIn(input);
  }, []);

  const signOut = useCallback(async () => {
    await cloudSignOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: ProfilePatch) => {
    await cloudUpdateProfile(patch);
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ user, isGuest: user === null, loading, signUp, signIn, signOut, updateProfile }),
    [user, loading, signUp, signIn, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
