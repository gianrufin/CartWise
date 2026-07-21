import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "./Icon";

interface Tab {
  to: string;
  label: string;
  icon: IconName;
}

const leftTabs: Tab[] = [
  { to: "/home", label: "Home", icon: "home" },
  { to: "/lists", label: "Lists", icon: "cart" },
];

const rightTabs: Tab[] = [
  { to: "/reports", label: "Reports", icon: "chart" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const allTabs: Tab[] = [
  ...leftTabs,
  { to: "/tally", label: "Tally", icon: "calculator" },
  ...rightTabs,
];

// Bottom navigation on mobile (with a raised glowing center Quick Tally button),
// sidebar on desktop (per docs/BLUEPRINT.md).
export function AppNav({ variant }: { variant: "bottom" | "sidebar" }) {
  if (variant === "sidebar") {
    return (
      <nav className="sidebar">
        <div className="brand">
          <Icon name="cart" size={24} /> CartWise
        </div>
        {allTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `${isActive ? "active" : ""} ${tab.to === "/tally" ? "accent" : ""}`
            }
          >
            <span className="nav-icon">
              <Icon name={tab.icon} size={20} />
            </span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  const tab = (t: Tab) => (
    <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? "active" : "")}>
      <span className="nav-icon">
        <Icon name={t.icon} size={21} />
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
        <span className="fab-circle">
          <Icon name="calculator" size={26} strokeWidth={1.9} />
        </span>
        <span>Tally</span>
      </NavLink>
      {rightTabs.map(tab)}
    </nav>
  );
}
