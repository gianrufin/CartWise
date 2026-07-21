import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useStore } from "../data/store";
import type { ItemStatus, PaymentMethod } from "../data/types";
import { actualTotal, PAYMENT_LABELS, unresolvedCount } from "../data/types";
import { formatCurrency } from "../utils/currency";

// Resolve options offered for each still-pending item at the end of a trip.
const resolveOptions: { status: ItemStatus; label: string }[] = [
  { status: "purchased", label: "Purchased" },
  { status: "unavailable", label: "Unavailable" },
  { status: "skipped", label: "Skip" },
  { status: "carried_over", label: "Carry over" },
];

const paymentMethods: PaymentMethod[] = [
  "cash",
  "gcash",
  "maya",
  "debit_card",
  "credit_card",
  "bank_transfer",
  "voucher",
  "other",
];

/**
 * End-of-trip review. Every unresolved item must be handled before the trip
 * can be completed (unless carried over). Then the user picks a payment method
 * and the trip is written to history.
 */
export function EndOfTrip() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { getList, updateItem, completeTrip } = useStore();
  const list = getList(listId);
  const [payment, setPayment] = useState<PaymentMethod>("cash");

  if (!list) {
    return (
      <div>
        <TopBar title="Finish shopping" />
        <div className="screen">
          <p className="muted">This list no longer exists.</p>
        </div>
      </div>
    );
  }

  const pending = list.items.filter((i) => i.status === "pending");
  const allResolved = pending.length === 0;
  const cartTotal = actualTotal(list.items);

  return (
    <div>
      <TopBar title="Finish shopping" />
      <div className="screen">
        {!allResolved ? (
          <>
            <div className="card">
              <div className="amount">You still have {unresolvedCount(list.items)} unresolved items</div>
              <p className="muted">Choose what to do with each before completing the trip.</p>
            </div>
            {pending.map((item) => (
              <div key={item.id} className="card" style={{ display: "grid", gap: "var(--space-sm)" }}>
                <div className="amount">{item.name}</div>
                <div className="muted">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""} · est.{" "}
                  {item.estimatedTotalPrice != null
                    ? formatCurrency(item.estimatedTotalPrice, list.currency, true)
                    : "—"}
                </div>
                <div className="shopping-actions">
                  {resolveOptions.map((opt) => (
                    <button
                      key={opt.status}
                      className="chip"
                      onClick={() => updateItem(list.id, item.id, { status: opt.status })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="card hero cyan" style={{ textAlign: "center" }}>
              <div className="caption" style={{ color: "#06222e" }}>
                Total spent
              </div>
              <div className="amount-lg" style={{ color: "#06222e" }}>
                {formatCurrency(cartTotal, list.currency, true)}
              </div>
            </div>

            <h2 className="section-title">Payment method</h2>
            <div className="chip-row">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`chip ${payment === method ? "selected" : ""}`}
                  onClick={() => setPayment(method)}
                >
                  {PAYMENT_LABELS[method]}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                const tripId = completeTrip(list.id, payment);
                navigate(`/trip/${tripId}`, { replace: true });
              }}
            >
              Complete trip
            </button>
          </>
        )}
      </div>
    </div>
  );
}
