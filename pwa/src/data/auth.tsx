import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext, type AuthApi, type ProfilePatch, type User, storeKeyFor } from "./authContext";
import { isCloudConfigured } from "./config";

// Phase 3 — accounts and sessions.
//
// Two backends behind one interface (see authContext.ts):
//  • Local (default): accounts + session in localStorage, so signup / signin /
//    guest-migration works offline and is fully testable.
//  • Supabase (when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set):
//    real cloud auth, lazy-loaded so supabase-js never ships to local builds.
// The backend is chosen once at load from isCloudConfigured.

export { useAuth, storeKeyFor } from "./authContext";
export type { User, AuthApi } from "./authContext";

const ACCOUNTS_KEY = "cartwise.accounts.v1";
const SESSION_KEY = "cartwise.session.v1";

const CloudAuthProvider = lazy(() => import("./cloud/CloudAuthProvider"));

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isCloudConfigured) {
    return (
      <Suspense fallback={null}>
        <CloudAuthProvider>{children}</CloudAuthProvider>
      </Suspense>
    );
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

/* ============================================================ local backend */

interface StoredAccount extends User {
  passwordHash: string;
}

// Local-only, non-cryptographic hash. NOT security — it exists so the local
// demo can tell a right vs. wrong password apart. Real credential handling is
// delegated to Supabase Auth in the cloud backend.
function hashPassword(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (((h << 5) + h) ^ pw.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

// Move any guest data into a freshly created account's namespace.
function migrateGuestData(userId: string) {
  const guestKey = storeKeyFor(null);
  const guestData = localStorage.getItem(guestKey);
  if (guestData) {
    localStorage.setItem(storeKeyFor(userId), guestData);
    localStorage.removeItem(guestKey);
  }
}

function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAccount[]>(loadAccounts);
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY)
  );

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  }, [userId]);

  const signUp = useCallback(
    async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) throw new Error("Email and password are required.");
      if (accounts.some((a) => a.email === normalized))
        throw new Error("An account with this email already exists.");

      const account: StoredAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: normalized,
        displayName: displayName?.trim() || normalized.split("@")[0],
        defaultCurrency: "PHP",
        subscriptionStatus: "free",
        passwordHash: hashPassword(password),
      };
      migrateGuestData(account.id);
      setAccounts((prev) => [...prev, account]);
      setUserId(account.id);
    },
    [accounts]
  );

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const normalized = email.trim().toLowerCase();
      const account = accounts.find((a) => a.email === normalized);
      if (!account || account.passwordHash !== hashPassword(password))
        throw new Error("Incorrect email or password.");
      setUserId(account.id);
    },
    [accounts]
  );

  const signOut = useCallback(async () => setUserId(null), []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return;
      setAccounts((prev) => prev.map((a) => (a.id === userId ? { ...a, ...patch } : a)));
    },
    [userId]
  );

  // Local accounts have no external source to re-read.
  const refreshUser = useCallback(async () => {}, []);

  const value = useMemo<AuthApi>(() => {
    const account = accounts.find((a) => a.id === userId) ?? null;
    const user: User | null = account
      ? {
          id: account.id,
          email: account.email,
          displayName: account.displayName,
          defaultCurrency: account.defaultCurrency,
          subscriptionStatus: account.subscriptionStatus ?? "free",
        }
      : null;
    return {
      user,
      isGuest: user === null,
      loading: false,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshUser,
    };
  }, [accounts, userId, signUp, signIn, signOut, updateProfile, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
