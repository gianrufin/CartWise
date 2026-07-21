import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "../components/AuthModal";
import { Icon } from "../components/Icon";

export function Welcome() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);

  return (
    <div className="welcome">
      <span className="logo" style={{ color: "var(--accent)" }}>
        <Icon name="cart" size={64} strokeWidth={1.5} />
      </span>
      <h1 className="amount-lg">CartWise</h1>
      <p className="muted">Plan together, shop live, and stay within budget.</p>
      <div className="actions">
        <button className="btn btn-primary btn-block" onClick={() => navigate("/home")}>
          Continue as guest
        </button>
        <button className="btn btn-outline btn-block" onClick={() => setAuthMode("signup")}>
          Create account
        </button>
        <button className="btn btn-text btn-block" onClick={() => setAuthMode("signin")}>
          Sign in
        </button>
      </div>

      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={() => {
            setAuthMode(null);
            navigate("/home");
          }}
        />
      )}
    </div>
  );
}
