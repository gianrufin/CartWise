import { useNavigate } from "react-router-dom";

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <button className="back" onClick={() => navigate(-1)} aria-label="Back">
        ←
      </button>
      <h1>{title}</h1>
    </header>
  );
}
