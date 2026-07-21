import { useNavigate } from "react-router-dom";
import { mockLists, mockTrips, monthSpendingTotal } from "../data/mock";
import { estimatedTotal, PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <h1 className="screen-title">Home</h1>

      <div className="card highlight">
        <div className="caption" style={{ color: "inherit" }}>
          This month
        </div>
        <div className="amount-lg">{formatCurrency(monthSpendingTotal, "PHP", true)}</div>
        <div style={{ font: "var(--font-body-sm)" }}>
          {mockTrips.length} trips completed
        </div>
      </div>

      <h2 className="section-title">Active lists</h2>
      {mockLists.map((list) => (
        <div
          key={list.id}
          className="card clickable"
          onClick={() => navigate(`/list/${list.id}`)}
        >
          <div className="row">
            <div>
              <div className="amount">{list.name}</div>
              <div className="muted">
                {list.items.length} items · budget{" "}
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

      <h2 className="section-title">Recent trips</h2>
      {mockTrips.map((trip) => (
        <div
          key={trip.id}
          className="card clickable"
          onClick={() => navigate(`/trip/${trip.id}`)}
        >
          <div className="row">
            <div>
              <div>{trip.listName}</div>
              <div className="muted">
                {trip.completedAtLabel} · {PAYMENT_LABELS[trip.paymentMethod]}
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

      <button className="fab" aria-label="Create list">
        +
      </button>
    </div>
  );
}
