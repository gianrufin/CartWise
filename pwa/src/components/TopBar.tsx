import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";

export function TopBar({ title, children }: { title: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <button className="back" onClick={() => navigate(-1)} aria-label="Back">
        <Icon name="arrow-left" size={20} />
      </button>
      <h1>{title}</h1>
      {children && <div className="topbar-actions">{children}</div>}
    </header>
  );
}
