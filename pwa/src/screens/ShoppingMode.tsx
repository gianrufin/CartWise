import { useNavigate, useParams } from "react-router-dom";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { useStore } from "../data/store";
import type { ItemStatus } from "../data/types";
import { actualTotal, resolvedCount, unresolvedCount } from "../data/types";
import { formatCurrency } from "../utils/currency";

const statusActions: { status: ItemStatus; label: string }[] = [
  { status: "purchased", label: "Purchased" },
  { status: "unavailable", label: "Unavailable" },
  { status: "skipped", label: "Skip" },
  { status: "carried_over", label: "Carry over" },
];

/**
 * Shopping Mode — the most important experience in the app.
 * Reads/writes the live list in the local store, so status changes and price
 * entry persist immediately (and survive a reload mid-trip).
 */
export function ShoppingMode() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { getList, updateItem } = useStore();
  const list = getList(listId);

  if (!list) {
    return (
      <div>
        <TopBar title="Shopping" />
        <div className="screen">
          <p className="muted">This list no longer exists.</p>
        </div>
      </div>
    );
  }

  const items = list.items;
  const cartTotal = actualTotal(items);
  const resolved = resolvedCount(items);
  const unresolved = unresolvedCount(items);

  const budget = list.budgetAmount;
  const remaining = (budget ?? 0) - cartTotal;
  const overBudget = budget != null && remaining < 0;
  const nearBudget = budget != null && !overBudget && budget > 0 && cartTotal >= budget * 0.85;
  const remainingClass = overBudget ? "danger-text" : nearBudget ? "warning-text" : "primary-text";

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
              {budget != null ? formatCurrency(Math.abs(remaining), list.currency, true) : "—"}
            </div>
          </div>
        </div>
        <div className="muted" style={{ marginTop: "var(--space-sm)" }}>
          {resolved} resolved · {unresolved} to go
          {overBudget && " · over budget"}
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
              <label htmlFor={`price-${item.id}`}>Actual price ({symbol(list.currency)})</label>
              <input
                id={`price-${item.id}`}
                inputMode="decimal"
                value={item.actualTotalPrice ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  updateItem(list.id, item.id, {
                    actualTotalPrice: Number.isNaN(v) ? undefined : v,
                  });
                }}
              />
            </div>
            <div className="shopping-actions">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  className={`chip ${item.status === action.status ? "selected" : ""}`}
                  onClick={() =>
                    updateItem(list.id, item.id, {
                      status: item.status === action.status ? "pending" : action.status,
                    })
                  }
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
          onClick={() => navigate(`/list/${list.id}/finish`)}
        >
          {unresolved > 0 ? `Finish shopping (${unresolved} unresolved)` : "Finish shopping"}
        </button>
      </div>
    </div>
  );
}

const symbol = (currency: string): string =>
  currency === "PHP" ? "₱" : currency === "USD" ? "$" : currency + " ";
