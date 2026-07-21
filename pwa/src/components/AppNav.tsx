import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/lists", label: "Lists", icon: "🛒" },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

// Bottom navigation on mobile, sidebar on desktop (per docs/BLUEPRINT.md).
export function AppNav({ variant }: { variant: "bottom" | "sidebar" }) {
  const links = tabs.map((tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      className={({ isActive }) => (isActive ? "active" : "")}
    >
      <span className="nav-icon" aria-hidden>
        {tab.icon}
      </span>
      <span>{tab.label}</span>
    </NavLink>
  ));

  if (variant === "sidebar") {
    return (
      <nav className="sidebar">
        <div className="brand">CartWise</div>
        {links}
      </nav>
    );
  }
  return <nav className="bottom-nav">{links}</nav>;
}
