const entries = [
  { title: "Profile", subtitle: "Guest — create an account to sync" },
  { title: "Currency", subtitle: "PHP (₱) — default" },
  { title: "Subscription", subtitle: "Free plan" },
  { title: "Households and groups", subtitle: "Available with an account" },
  { title: "Privacy", subtitle: "Private lists, data visibility" },
  { title: "Data export", subtitle: "Premium feature" },
  { title: "Delete my data", subtitle: "Remove local data from this device" },
];

// Placeholder settings — sections become functional across Phases 3–9.
export function Settings() {
  return (
    <div className="screen">
      <h1 className="screen-title">Settings</h1>
      <div className="card" style={{ padding: 0 }}>
        {entries.map((entry, i) => (
          <div key={entry.title}>
            <div style={{ padding: "var(--space-lg)", minHeight: "var(--touch-target)" }}>
              <div>{entry.title}</div>
              <div className="muted">{entry.subtitle}</div>
            </div>
            {i < entries.length - 1 && <hr className="divider" />}
          </div>
        ))}
      </div>
      <p className="caption">CartWise 0.1.0 — Phase 0 foundation build</p>
    </div>
  );
}
