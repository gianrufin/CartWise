import { NavLink } from "react-router-dom";

const leftTabs = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/lists", label: "Lists", icon: "🛒" },
];

const rightTabs = [
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

const allTabs = [...leftTabs, { to: "/tally", label: "Tally", icon: "🧮" }, ...rightTabs];

// Bottom navigation on mobile (with a raised glowing center Quick Tally button),
// sidebar on desktop (per docs/BLUEPRINT.md).
export function AppNav({ variant }: { variant: "bottom" | "sidebar" }) {
  if (variant === "sidebar") {
    return (
      <nav className="sidebar">
        <div className="brand">
          <span aria-hidden>🛒</span> CartWise
        </div>
        {allTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `${isActive ? "active" : ""} ${tab.to === "/tally" ? "accent" : ""}`
            }
          >
            <span className="nav-icon" aria-hidden>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  const tab = (t: { to: string; label: string; icon: string }) => (
    <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? "active" : "")}>
      <span className="nav-icon" aria-hidden>
        {t.icon}
      </span>
      <span>{t.label}</span>
    </NavLink>
  );

  return (
    <nav className="bottom-nav">
      {leftTabs.map(tab)}
      <NavLink
        to="/tally"
        className={({ isActive }) => `nav-center ${isActive ? "active" : ""}`}
      >
        <span className="fab-circle" aria-hidden>
          🧮
        </span>
        <span>Tally</span>
      </NavLink>
      {rightTabs.map(tab)}
    </nav>
  );
}
