import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "../components/AuthModal";
import { currencies } from "../data/constants";
import { useAuth } from "../data/auth";
import { isCloudConfigured } from "../data/config";
import { isPremium } from "../data/entitlements";

export function Settings() {
  const navigate = useNavigate();
  const { user, isGuest, signOut, updateProfile } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);

  return (
    <div className="screen">
      <h1 className="screen-title">Settings</h1>

      {/* Profile / account */}
      <div className="card">
        <div className="caption">Account</div>
        {user ? (
          <>
            <div className="amount" style={{ marginTop: 4 }}>
              {user.displayName}
            </div>
            <div className="muted">{user.email}</div>
            <button
              className="btn btn-outline btn-block"
              style={{ marginTop: "var(--space-md)" }}
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <div className="amount" style={{ marginTop: 4 }}>
              Guest
            </div>
            <div className="muted">
              Create an account to sync across devices and share lists.
            </div>
            <div className="field-row" style={{ marginTop: "var(--space-md)" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setAuthMode("signup")}
              >
                Create account
              </button>
              <button className="btn btn-outline" onClick={() => setAuthMode("signin")}>
                Sign in
              </button>
            </div>
          </>
        )}
      </div>

      {/* Default currency */}
      <div className="card">
        <div className="caption">Default currency</div>
        {user ? (
          <select
            className="settings-select"
            value={user.defaultCurrency}
            onChange={(e) => updateProfile({ defaultCurrency: e.target.value })}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="muted" style={{ marginTop: 4 }}>
            PHP (₱) — sign in to change your default currency. Each list still
            keeps its own currency.
          </div>
        )}
      </div>

      {/* Subscription */}
      <div
        className="card clickable"
        onClick={() => navigate("/subscription")}
      >
        <div className="row">
          <div>
            <div className="caption">Subscription</div>
            <div className="amount" style={{ marginTop: 4 }}>
              {isPremium(user) ? "Premium" : "Free"}
            </div>
          </div>
          <span className="badge shared">{isPremium(user) ? "Manage" : "Upgrade"}</span>
        </div>
      </div>

      <p className="caption">
        CartWise 0.1.0 — {isGuest ? "guest mode" : "signed in"} ·{" "}
        {isCloudConfigured ? "cloud sync on" : "local storage (cloud sync not configured)"}
      </p>

      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  );
}
