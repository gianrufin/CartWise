import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useStore } from "../data/store";
import { PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

export function TripSummary() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { getTrip } = useStore();
  const trip = getTrip(tripId);

  if (!trip) {
    return (
      <div>
        <TopBar title="Trip summary" />
        <div className="screen">
          <p className="muted">This trip could not be found.</p>
          <button className="btn btn-outline" onClick={() => navigate("/home")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const underBudget = trip.budgetAmount != null && trip.actualTotal <= trip.budgetAmount;
  const diff = trip.budgetAmount != null ? Math.abs(trip.budgetAmount - trip.actualTotal) : null;

  const rows: [string, string][] = [
    ["List", trip.listName],
    ["Date", formatDate(trip.completedAt)],
    ["Payment method", PAYMENT_LABELS[trip.paymentMethod]],
    ["Purchased", `${trip.purchasedCount} items`],
    ["Unavailable", `${trip.unavailableCount} items`],
    ["Skipped", `${trip.skippedCount} items`],
    ["Carried over", `${trip.carriedOverCount} items`],
  ];

  return (
    <div>
      <TopBar title="Trip summary" />
      <div className="screen">
        <div className="card hero cyan" style={{ textAlign: "center" }}>
          <div className="caption" style={{ color: "#06222e" }}>
            Total spent
          </div>
          <div className="amount-lg" style={{ color: "#06222e" }}>
            {formatCurrency(trip.actualTotal, trip.currency, true)}
          </div>
          {trip.budgetAmount != null && diff != null && (
            <div style={{ font: "var(--font-body-sm)", color: "#06343f" }}>
              {formatCurrency(diff, trip.currency, true)} {underBudget ? "under" : "over"} a{" "}
              {formatCurrency(trip.budgetAmount, trip.currency, true)} budget
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {rows.map(([label, value], i) => (
            <div key={label}>
              <div className="row" style={{ padding: "var(--space-md) var(--space-lg)" }}>
                <span className="muted">{label}</span>
                <span>{value}</span>
              </div>
              {i < rows.length - 1 && <hr className="divider" />}
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-block" onClick={() => navigate("/home")}>
          Done
        </button>
        {trip.carriedOverCount > 0 && (
          <button
            className="btn btn-outline btn-block"
            onClick={() => navigate(`/list/${trip.listId}`)}
          >
            Back to list ({trip.carriedOverCount} carried over)
          </button>
        )}
      </div>
    </div>
  );
}
