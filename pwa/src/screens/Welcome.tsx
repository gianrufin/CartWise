import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";

export function Welcome() {
  const navigate = useNavigate();
  // Account flows arrive in Phase 3; guest mode is the only working path for now.
  const enter = () => navigate("/home");

  return (
    <div className="welcome">
      <span className="logo" style={{ color: "var(--accent)" }}>
        <Icon name="cart" size={64} strokeWidth={1.5} />
      </span>
      <h1 className="amount-lg">CartWise</h1>
      <p className="muted">Plan together, shop live, and stay within budget.</p>
      <div className="actions">
        <button className="btn btn-primary btn-block" onClick={enter}>
          Continue as guest
        </button>
        <button className="btn btn-outline btn-block" onClick={enter}>
          Create account
        </button>
        <button className="btn btn-text btn-block" onClick={enter}>
          Sign in
        </button>
      </div>
    </div>
  );
}
