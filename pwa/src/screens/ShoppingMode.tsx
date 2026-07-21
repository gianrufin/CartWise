import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { listById } from "../data/mock";
import type { ItemStatus, ListItem } from "../data/types";
import { actualTotal, isResolved } from "../data/types";
import { formatCurrency } from "../utils/currency";

const statusActions: { status: ItemStatus; label: string }[] = [
  { status: "purchased", label: "Purchased" },
  { status: "unavailable", label: "Unavailable" },
  { status: "skipped", label: "Skip" },
  { status: "carried_over", label: "Carry over" },
];

/**
 * Shopping Mode — the most important experience in the app.
 * Phase 0: interactive with in-memory state on top of mock data; totals react
 * to status changes and price entry. Persistence arrives in Phase 1.
 */
export function ShoppingMode() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = listById(listId);
  const [items, setItems] = useState<ListItem[]>(list.items);

  const cartTotal = actualTotal(items);
  const resolved = items.filter(isResolved).length;
  const unresolved = items.length - resolved;

  const budget = list.budgetAmount;
  const remaining = (budget ?? 0) - cartTotal;
  const overBudget = budget != null && remaining < 0;
  const nearBudget = budget != null && !overBudget && budget > 0 && cartTotal >= budget * 0.85;
  const remainingClass = overBudget ? "danger-text" : nearBudget ? "warning-text" : "primary-text";

  const update = (id: string, patch: Partial<ListItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div>
      <TopBar title={`Shopping · ${list.name}`} />
      <div className="budget-summary">
        <div className="cells">
          <div>
            <div className="caption">Budget</div>
            <div className="amount">
              {budget != null ? formatCurrency(budget, list.currency, true) : "—"}
            </div>
          </div>
          <div>
            <div className="caption">Cart total</div>
            <div className="amount-lg">{formatCurrency(cartTotal, list.currency, true)}</div>
          </div>
          <div>
            <div className="caption">{overBudget ? "Over budget" : "Remaining"}</div>
            <div className={`amount ${remainingClass}`}>
              {formatCurrency(Math.abs(remaining), list.currency, true)}
            </div>
          </div>
        </div>
        <div className="muted" style={{ marginTop: "var(--space-sm)" }}>
          {resolved} resolved · {unresolved} to go
        </div>
      </div>

      <div className="screen">
        {items.map((item) => (
          <div key={item.id} className="card" style={{ display: "grid", gap: "var(--space-sm)" }}>
            <div className="row">
              <div>
                <div className="amount">{item.name}</div>
                <div className="muted">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                  {item.store ? ` · ${item.store}` : ""} · est.{" "}
                  {item.estimatedTotalPrice != null
                    ? formatCurrency(item.estimatedTotalPrice, list.currency, true)
                    : "—"}
                </div>
                {item.notes && <div className="muted">{item.notes}</div>}
              </div>
              <StatusChip status={item.status} />
            </div>
            <div className="field">
              <label htmlFor={`price-${item.id}`}>Actual price (₱)</label>
              <input
                id={`price-${item.id}`}
                inputMode="decimal"
                value={item.actualTotalPrice ?? ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  update(item.id, {
                    actualTotalPrice: Number.isNaN(value) ? undefined : value,
                  });
                }}
              />
            </div>
            <div className="shopping-actions">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  className={`chip ${item.status === action.status ? "selected" : ""}`}
                  onClick={() => update(item.id, { status: action.status })}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="shopping-footer">
        <button
          className="btn btn-primary btn-block"
          onClick={() => navigate("/trip/trip-1")}
        >
          {unresolved > 0 ? `Finish shopping (${unresolved} unresolved)` : "Finish shopping"}
        </button>
      </div>
    </div>
  );
}
