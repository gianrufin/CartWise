import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { tripById } from "../data/mock";
import { PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function TripSummary() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const trip = tripById(tripId);
  const underBudget = trip.budgetAmount != null && trip.actualTotal <= trip.budgetAmount;
  const diff =
    trip.budgetAmount != null ? Math.abs(trip.budgetAmount - trip.actualTotal) : null;

  const rows = [
    ["List", trip.listName],
    ["Date", trip.completedAtLabel],
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
        <div className="card highlight" style={{ textAlign: "center" }}>
          <div className="caption" style={{ color: "inherit" }}>
            Total spent
          </div>
          <div className="amount-lg">
            {formatCurrency(trip.actualTotal, trip.currency, true)}
          </div>
          {trip.budgetAmount != null && diff != null && (
            <div style={{ font: "var(--font-body-sm)" }}>
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
        <button className="btn btn-outline btn-block">
          Start new list from carried-over items
        </button>
      </div>
    </div>
  );
}
