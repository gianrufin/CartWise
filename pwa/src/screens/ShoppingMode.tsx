import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Segmented } from "../components/Segmented";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { roleCan } from "../data/permissions";
import { useStore } from "../data/store";
import type { ItemStatus, ListItem } from "../data/types";
import { actualTotal, isResolved, resolvedCount, unresolvedCount } from "../data/types";
import { formatCurrency } from "../utils/currency";
import { groupItems, type GroupBy } from "../utils/group";

const statusActions: { status: ItemStatus; label: string }[] = [
  { status: "purchased", label: "Purchased" },
  { status: "unavailable", label: "Unavailable" },
  { status: "skipped", label: "Skip" },
  { status: "carried_over", label: "Carry over" },
];

/**
 * Shopping Mode — the most important experience in the app.
 * Reads/writes the live list in the local store (changes persist mid-trip),
 * with grouping by store/category, search, a hide-resolved filter, per-group
 * subtotals, and one-tap purchase that prefills the estimated price.
 */
export function ShoppingMode() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { getList, updateItem } = useStore();
  const list = getList(listId);

  const [groupBy, setGroupBy] = useState<GroupBy>("category");
  const [query, setQuery] = useState("");
  const [hideResolved, setHideResolved] = useState(false);

  const items = list?.items ?? [];
  const cartTotal = actualTotal(items);
  const resolved = resolvedCount(items);
  const unresolved = unresolvedCount(items);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if (hideResolved && isResolved(it)) return false;
      if (q && !it.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return groupItems(filtered, groupBy);
  }, [items, query, hideResolved, groupBy]);

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

  const budget = list.budgetAmount;
  const remaining = (budget ?? 0) - cartTotal;
  const overBudget = budget != null && remaining < 0;
  const nearBudget = budget != null && !overBudget && budget > 0 && cartTotal >= budget * 0.85;
  const remainingClass = overBudget ? "danger-text" : nearBudget ? "warning-text" : "primary-text";

  // Viewers/contributors can watch a trip but not mark items or enter prices.
  const canShop = roleCan(list.role, "markPurchased");
  // Phase 5: a collaborator without spending permission sees estimates only.
  const canViewSpending = list.canViewSpending ?? true;

  // Toggling a status; marking purchased with no actual price prefills the
  // estimate so totals move with a single tap.
  const setStatus = (item: ListItem, status: ItemStatus) => {
    const next = item.status === status ? "pending" : status;
    const patch: Partial<ListItem> = { status: next };
    if (next === "purchased" && item.actualTotalPrice == null && item.estimatedTotalPrice != null) {
      patch.actualTotalPrice = item.estimatedTotalPrice;
    }
    updateItem(list.id, item.id, patch);
  };

  const visibleCount = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <TopBar title={`Shopping · ${list.name}`} />
      <div className="budget-summary">
        {canViewSpending ? (
          <>
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
          </>
        ) : (
          <>
            <div className="caption">Progress</div>
            <div className="amount-lg">
              {resolved}/{items.length} items
            </div>
            <div className="muted">Spending is hidden for your role on this list.</div>
          </>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <Icon name="cart" size={18} />
          <input
            placeholder="Search items"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search items"
          />
          {query && (
            <button
              className="icon-btn"
              style={{ minWidth: 32, minHeight: 32, border: "none", background: "transparent" }}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div className="toolbar-row">
          <Segmented<GroupBy>
            ariaLabel="Group items by"
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: "category", label: "Category" },
              { value: "store", label: "Store" },
              { value: "none", label: "None" },
            ]}
          />
          <button
            className={`filter-toggle ${hideResolved ? "on" : ""}`}
            onClick={() => setHideResolved((v) => !v)}
          >
            Hide resolved
          </button>
        </div>
      </div>

      <div className="screen">
        {visibleCount === 0 && (
          <p className="muted" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
            {items.length === 0 ? "This list has no items." : "No items match your filters."}
          </p>
        )}
        {groups.map((group) => (
          <div key={group.key}>
            {group.label && (
              <div className="group-header">
                <span className="group-name">{group.label}</span>
                <span className="group-total">
                  {group.actual > 0
                    ? `${formatCurrency(group.actual, list.currency, true)} spent`
                    : `est. ${formatCurrency(group.estimated, list.currency, true)}`}
                </span>
              </div>
            )}
            <div style={{ display: "grid", gap: "var(--space-md)" }}>
              {group.items.map((item) => (
                <div key={item.id} className="card" style={{ display: "grid", gap: "var(--space-sm)" }}>
                  <div className="row">
                    <div>
                      <div className="amount">{item.name}</div>
                      <div className="muted">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                        {groupBy !== "store" && item.store ? ` · ${item.store}` : ""} · est.{" "}
                        {item.estimatedTotalPrice != null
                          ? formatCurrency(item.estimatedTotalPrice, list.currency, true)
                          : "—"}
                      </div>
                      {item.notes && <div className="muted">{item.notes}</div>}
                    </div>
                    <StatusChip status={item.status} />
                  </div>
                  {canShop ? (
                    <>
                      <div className="field">
                        <label htmlFor={`price-${item.id}`}>
                          Actual price ({symbol(list.currency)})
                        </label>
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
                            onClick={() => setStatus(item, action.status)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    canViewSpending &&
                    item.actualTotalPrice != null && (
                      <div className="muted">
                        Actual {formatCurrency(item.actualTotalPrice, list.currency, true)}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {roleCan(list.role, "completeTrip") && (
        <div className="shopping-footer">
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate(`/list/${list.id}/finish`)}
          >
            {unresolved > 0 ? `Finish shopping (${unresolved} unresolved)` : "Finish shopping"}
          </button>
        </div>
      )}
    </div>
  );
}

const symbol = (currency: string): string =>
  currency === "PHP" ? "₱" : currency === "USD" ? "$" : currency + " ";
