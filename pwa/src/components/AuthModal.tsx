import { useState } from "react";
import { useAuth } from "../data/auth";
import { Icon } from "./Icon";

type Mode = "signin" | "signup";

interface Props {
  initialMode?: Mode;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ initialMode = "signin", onClose, onSuccess }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    try {
      if (mode === "signup") {
        signUp({ email, password, displayName });
      } else {
        signIn({ email, password });
      }
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: "var(--space-sm)" }}>
          <h2 className="screen-title">
            {mode === "signup" ? "Create account" : "Sign in"}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className="muted">
          {mode === "signup"
            ? "Your guest lists move into your new account, and you can sync and share once cloud is enabled."
            : "Welcome back. Sign in to reach your synced lists."}
        </p>

        {mode === "signup" && (
          <div className="field">
            <label htmlFor="auth-name">Display name</label>
            <input
              id="auth-name"
              placeholder="e.g. Anna"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </div>

        {error && <div className="warn-banner danger-banner">{error}</div>}

        <button
          className="btn btn-primary btn-block"
          disabled={!email.trim() || !password}
          onClick={submit}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button
          className="btn btn-text btn-block"
          onClick={() => {
            setError(null);
            setMode(mode === "signup" ? "signin" : "signup");
          }}
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
