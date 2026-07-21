import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useStore } from "../data/store";
import { PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

// Basic monthly spending summary (Phase 1). Richer reports land in Phase 7.
export function Reports() {
  const navigate = useNavigate();
  const { trips, monthSpendingTotal } = useStore();

  if (trips.length === 0) {
    return (
      <EmptyState
        icon="chart"
        message="Complete a shopping trip to see your spending summary."
      />
    );
  }

  const avg = trips.reduce((s, t) => s + t.actualTotal, 0) / trips.length;

  return (
    <div className="screen">
      <h1 className="screen-title">Reports</h1>

      <div className="card hero">
        <div className="caption" style={{ color: "rgba(255,255,255,0.85)" }}>
          Spent this month
        </div>
        <div className="amount-lg">{formatCurrency(monthSpendingTotal, "PHP", true)}</div>
      </div>

      <div className="field-row">
        <div className="card" style={{ flex: 1 }}>
          <div className="caption">Trips</div>
          <div className="amount">{trips.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="caption">Avg / trip</div>
          <div className="amount">{formatCurrency(avg, "PHP", true)}</div>
        </div>
      </div>

      <h2 className="section-title">Trip history</h2>
      {trips.map((trip) => {
        const under = trip.budgetAmount != null && trip.actualTotal <= trip.budgetAmount;
        return (
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
              <div style={{ textAlign: "right" }}>
                <div className="amount">{formatCurrency(trip.actualTotal, trip.currency, true)}</div>
                {trip.budgetAmount != null && (
                  <div className={`caption ${under ? "positive-text" : "danger-text"}`}>
                    {under ? "under budget" : "over budget"}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
