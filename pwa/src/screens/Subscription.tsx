import { useEffect, useRef, useState } from "react";
import { AuthModal } from "../components/AuthModal";
import { Icon } from "../components/Icon";
import { PayPalButton } from "../components/PayPalButton";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../data/auth";
import { isPaypalConfigured } from "../data/config";
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
 * Subscription screen (Phase 8). When PayPal is configured, shows the real
 * PayPal subscription button; premium unlocks only after PayPal's webhook marks
 * the account active (we poll users_profile via refreshUser). Otherwise it
 * falls back to a dev demo upgrade for testing the gates.
 */
export function Subscription() {
  const { user, isGuest, updateProfile, refreshUser } = useAuth();
  const premium = isPremium(user);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // After PayPal approval, poll for the webhook to flip the status to active.
  useEffect(() => {
    if (!awaiting) return;
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      await refreshUser();
      if (tries >= 20 && pollRef.current) {
        clearInterval(pollRef.current);
        setAwaiting(false);
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [awaiting, refreshUser]);

  useEffect(() => {
    if (premium && pollRef.current) {
      clearInterval(pollRef.current);
      setAwaiting(false);
    }
  }, [premium]);

  const demoSetPlan = async (status: string) => {
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
          <div className="card">
            <p className="muted">
              You're on Premium. Manage or cancel your subscription anytime from your
              PayPal account.
            </p>
          </div>
        ) : isPaypalConfigured && user ? (
          <>
            {awaiting ? (
              <div className="card">
                <p className="muted">
                  Payment received — activating your subscription… this can take a few
                  seconds.
                </p>
              </div>
            ) : (
              <PayPalButton userId={user.id} onApproved={() => setAwaiting(true)} />
            )}
          </>
        ) : (
          <>
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => demoSetPlan("active")}>
              {busy ? "…" : "Upgrade to Premium"}
            </button>
            <p className="caption" style={{ textAlign: "center" }}>
              Demo build — no real payment. Connect PayPal (see docs/PAYMENTS.md) to take
              real subscriptions.
            </p>
          </>
        )}

        {premium && !isPaypalConfigured && (
          <button className="btn btn-text btn-block" onClick={() => demoSetPlan("free")}>
            Downgrade (demo)
          </button>
        )}
      </div>

      {showAuth && (
        <AuthModal initialMode="signup" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}
    </div>
  );
}
