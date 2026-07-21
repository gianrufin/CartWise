import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Phase 3 — accounts and sessions.
//
// This is a LOCAL auth implementation: accounts and the active session live in
// localStorage so the whole signup / signin / migration flow is real and
// testable offline. It is deliberately behind a small interface so a Supabase
// Auth backend can replace it when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// are configured (see docs + .env.example). No password is ever sent anywhere;
// the cloud path will delegate credentials to Supabase Auth entirely.

const ACCOUNTS_KEY = "cartwise.accounts.v1";
const SESSION_KEY = "cartwise.session.v1";
const STORE_PREFIX = "cartwise.store.";

export function storeKeyFor(userId: string | null): string {
  return `${STORE_PREFIX}${userId ?? "guest"}.v1`;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
}

interface StoredAccount extends User {
  passwordHash: string;
}

// Local-only, non-cryptographic hash. NOT security — it exists so the local
// demo can distinguish a right vs. wrong password. Real credential handling is
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

interface AuthApi {
  user: User | null;
  isGuest: boolean;
  signUp: (input: { email: string; password: string; displayName?: string }) => void;
  signIn: (input: { email: string; password: string }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "displayName" | "defaultCurrency">>) => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
    ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) throw new Error("Email and password are required.");
      if (accounts.some((a) => a.email === normalized))
        throw new Error("An account with this email already exists.");

      const account: StoredAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: normalized,
        displayName: displayName?.trim() || normalized.split("@")[0],
        defaultCurrency: "PHP",
        passwordHash: hashPassword(password),
      };
      migrateGuestData(account.id);
      setAccounts((prev) => [...prev, account]);
      setUserId(account.id);
    },
    [accounts]
  );

  const signIn = useCallback(
    ({ email, password }: { email: string; password: string }) => {
      const normalized = email.trim().toLowerCase();
      const account = accounts.find((a) => a.email === normalized);
      if (!account || account.passwordHash !== hashPassword(password))
        throw new Error("Incorrect email or password.");
      setUserId(account.id);
    },
    [accounts]
  );

  const signOut = useCallback(() => setUserId(null), []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, "displayName" | "defaultCurrency">>) => {
      if (!userId) return;
      setAccounts((prev) => prev.map((a) => (a.id === userId ? { ...a, ...patch } : a)));
    },
    [userId]
  );

  const value = useMemo<AuthApi>(() => {
    const account = accounts.find((a) => a.id === userId) ?? null;
    const user: User | null = account
      ? {
          id: account.id,
          email: account.email,
          displayName: account.displayName,
          defaultCurrency: account.defaultCurrency,
        }
      : null;
    return { user, isGuest: user === null, signUp, signIn, signOut, updateProfile };
  }, [accounts, userId, signUp, signIn, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
