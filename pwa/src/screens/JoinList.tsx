import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthModal } from "../components/AuthModal";
import { Icon } from "../components/Icon";
import { useAuth } from "../data/auth";
import { isCloudConfigured } from "../data/config";
import { acceptInvite } from "../data/cloud/sharing";
import { useStore } from "../data/store";

// Landing screen for an invite link (/join/:token). Requires an account —
// guests are prompted to sign in / create one, then the invite is accepted.
export function JoinList() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useStore();
  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!user || !token || attempted.current) return;
    attempted.current = true;
    setStatus("joining");
    acceptInvite(token)
      .then((listId) => {
        refresh();
        navigate(`/list/${listId}`, { replace: true });
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      });
  }, [user, token, navigate, refresh]);

  if (!isCloudConfigured) {
    return (
      <div className="welcome">
        <Icon name="cart" size={56} style={{ color: "var(--accent)" }} />
        <h1 className="screen-title">Sharing needs the cloud</h1>
        <p className="muted">This build isn't connected to an account backend.</p>
      </div>
    );
  }

  return (
    <div className="welcome">
      <Icon name="cart" size={56} style={{ color: "var(--accent)" }} />
      <h1 className="screen-title">You've been invited</h1>
      {!user ? (
        <>
          <p className="muted">Sign in or create a free account to join this shared list.</p>
          <div className="actions">
            <button className="btn btn-primary btn-block" onClick={() => setShowAuth(true)}>
              Sign in / Create account
            </button>
          </div>
        </>
      ) : status === "error" ? (
        <>
          <p className="muted">{error}</p>
          <button className="btn btn-outline" onClick={() => navigate("/home")}>
            Go home
          </button>
        </>
      ) : (
        <p className="muted">Joining…</p>
      )}

      {showAuth && (
        <AuthModal
          initialMode="signup"
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}
