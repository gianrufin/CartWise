import { useState } from "react";
import { AuthModal } from "../components/AuthModal";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../data/auth";
import { isPremium } from "../data/entitlements";

const PREMIUM_PERKS = [
  "Unlimited active & shared lists",
  "More than one collaborator per list",
  "Full spending history + date ranges",
  "Store & payment-method breakdowns",
  "CSV export",
  "Advanced roles & private lists",
];

const FREE_PERKS = [
  "One shared list, one collaborator",
  "Live collaboration",
  "Shopping mode & budgets",
  "This month's spending summary",
];

/**
 * Subscription screen (Phase 8). Real billing (Google Play on Android, a web
 * provider later) is out of scope for this build — the "upgrade" here flips the
 * entitlement for demo/testing so premium gates can be exercised end to end.
 */
export function Subscription() {
  const { user, isGuest, updateProfile } = useAuth();
  const premium = isPremium(user);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const setPlan = async (status: string) => {
    setBusy(true);
    try {
      await updateProfile({ subscriptionStatus: status });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <TopBar title="Subscription" />
      <div className="screen">
        <div className={`card hero ${premium ? "" : "cyan"}`} style={{ textAlign: "center" }}>
          <div className="caption" style={{ color: premium ? "rgba(255,255,255,0.85)" : "#06222e" }}>
            Current plan
          </div>
          <div className="amount-lg" style={{ color: premium ? "#fff" : "#06222e" }}>
            {premium ? "Premium" : "Free"}
          </div>
        </div>

        <div className="card">
          <div className="row">
            <h2 className="section-title" style={{ marginTop: 0 }}>Premium</h2>
            <span className="badge shared">Recommended</span>
          </div>
          {PREMIUM_PERKS.map((p) => (
            <div key={p} className="row" style={{ padding: "6px 0", justifyContent: "flex-start", gap: "var(--space-sm)" }}>
              <Icon name="plus" size={16} style={{ color: "var(--accent)" }} />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginTop: 0 }}>Free</h2>
          {FREE_PERKS.map((p) => (
            <div key={p} className="muted" style={{ padding: "4px 0" }}>
              {p}
            </div>
          ))}
        </div>

        {isGuest ? (
          <>
            <p className="muted">Create an account to subscribe and unlock premium.</p>
            <button className="btn btn-primary btn-block" onClick={() => setShowAuth(true)}>
              Create account
            </button>
          </>
        ) : premium ? (
          <button className="btn btn-outline btn-block" disabled={busy} onClick={() => setPlan("free")}>
            {busy ? "…" : "Downgrade to Free"}
          </button>
        ) : (
          <button className="btn btn-primary btn-block" disabled={busy} onClick={() => setPlan("active")}>
            {busy ? "…" : "Upgrade to Premium"}
          </button>
        )}

        <p className="caption" style={{ textAlign: "center" }}>
          Demo build — no real payment is taken. Billing (Google Play / web provider)
          comes with the store release.
        </p>
      </div>

      {showAuth && (
        <AuthModal initialMode="signup" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}
    </div>
  );
}
