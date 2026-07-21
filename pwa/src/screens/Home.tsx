import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ListFormModal } from "../components/ListFormModal";
import { useStore } from "../data/store";
import { estimatedTotal, PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

export function Home() {
  const navigate = useNavigate();
  const { activeLists, trips, monthSpendingTotal, createList } = useStore();
  const [creating, setCreating] = useState(false);
  const recentTrips = trips.slice(0, 3);

  return (
    <div className="screen">
      <div className="greeting">
        Hey there!
        <br />
        <span className="muted">What are we buying today?</span>
      </div>

      <div className="card hero">
        <div className="caption" style={{ color: "rgba(255,255,255,0.85)" }}>
          Spent this month
        </div>
        <div className="amount-lg">{formatCurrency(monthSpendingTotal, "PHP", true)}</div>
        <div style={{ font: "var(--font-body-sm)", opacity: 0.9 }}>
          {trips.length} {trips.length === 1 ? "trip" : "trips"} completed
        </div>
      </div>

      <div className="card hero cyan clickable" onClick={() => navigate("/tally")}>
        <div className="row">
          <div
            style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", color: "#06222e" }}
          >
            <Icon name="calculator" size={28} strokeWidth={1.7} />
            <div>
              <div className="amount" style={{ color: "#06222e" }}>
                Quick Tally
              </div>
              <div style={{ font: "var(--font-body-sm)", color: "#06343f" }}>
                Add prices on the fly — no list needed
              </div>
            </div>
          </div>
          <Icon name="arrow-right" size={22} style={{ color: "#06222e" }} />
        </div>
      </div>

      <h2 className="section-title">Active lists</h2>
      {activeLists.length === 0 && (
        <div className="card">
          <p className="muted">Create your first grocery list and start tracking your budget.</p>
        </div>
      )}
      {activeLists.map((list) => (
        <div
          key={list.id}
          className="card clickable"
          onClick={() => navigate(`/list/${list.id}`)}
        >
          <div className="row">
            <div>
              <div className="amount">{list.name}</div>
              <div className="muted">
                {list.items.length} {list.items.length === 1 ? "item" : "items"} · budget{" "}
                {list.budgetAmount != null
                  ? formatCurrency(list.budgetAmount, list.currency, true)
                  : "—"}
              </div>
            </div>
            <span className="amount primary-text">
              {formatCurrency(estimatedTotal(list.items), list.currency, true)}
            </span>
          </div>
        </div>
      ))}

      {recentTrips.length > 0 && <h2 className="section-title">Recent trips</h2>}
      {recentTrips.map((trip) => (
        <div
          key={trip.id}
          className="card clickable"
          onClick={() => navigate(`/trip/${trip.id}`)}
        >
          <div className="row">
            <div>
              <div>{trip.listName}</div>
              <div className="muted">
                {formatDate(trip.completedAt)} · {PAYMENT_LABELS[trip.paymentMethod]}
              </div>
            </div>
            <span className="amount">
              {formatCurrency(trip.actualTotal, trip.currency, true)}
            </span>
          </div>
        </div>
      ))}

      <p className="muted">
        You're in guest mode. Create a free account to share lists and sync across
        devices.
      </p>

      <button className="fab" aria-label="Create list" onClick={() => setCreating(true)}>
        <Icon name="plus" size={26} strokeWidth={2} />
      </button>

      {creating && (
        <ListFormModal
          onClose={() => setCreating(false)}
          onSubmit={(values) => {
            const id = createList(values);
            setCreating(false);
            navigate(`/list/${id}`);
          }}
        />
      )}
    </div>
  );
}
