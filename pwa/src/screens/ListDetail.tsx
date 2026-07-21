import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { listById } from "../data/mock";
import { estimatedTotal } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = listById(listId);

  const estimate = estimatedTotal(list.items);
  const remaining = (list.budgetAmount ?? 0) - estimate;
  const grouped = new Map<string, typeof list.items>();
  for (const item of list.items) {
    const key = item.category ?? "Other";
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return (
    <div>
      <TopBar title={list.name} />
      <div className="screen">
        <div className="card">
          <div className="cells row">
            <div>
              <div className="caption">Budget</div>
              <div className="amount">
                {list.budgetAmount != null
                  ? formatCurrency(list.budgetAmount, list.currency, true)
                  : "—"}
              </div>
            </div>
            <div>
              <div className="caption">Estimated</div>
              <div className="amount">{formatCurrency(estimate, list.currency, true)}</div>
            </div>
            <div>
              <div className="caption">{remaining >= 0 ? "Remaining" : "Over budget"}</div>
              <div className={`amount ${remaining >= 0 ? "primary-text" : "danger-text"}`}>
                {formatCurrency(Math.abs(remaining), list.currency, true)}
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={() => navigate(`/list/${list.id}/shopping`)}
        >
          Start shopping
        </button>

        {[...grouped.entries()].map(([category, items]) => (
          <div key={category}>
            <h2 className="section-title" style={{ marginBottom: "var(--space-sm)" }}>
              {category}
            </h2>
            <div className="card" style={{ padding: 0 }}>
              {items.map((item, i) => (
                <div key={item.id}>
                  <div className="row" style={{ padding: "var(--space-md) var(--space-lg)" }}>
                    <div>
                      <div>{item.name}</div>
                      <div className="muted">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                        {item.store ? ` · ${item.store}` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "grid", gap: "4px" }}>
                      <span style={{ font: "var(--font-body-sm)" }}>
                        {item.estimatedTotalPrice != null
                          ? formatCurrency(item.estimatedTotalPrice, list.currency, true)
                          : "—"}
                      </span>
                      <StatusChip status={item.status} />
                    </div>
                  </div>
                  {i < items.length - 1 && <hr className="divider" />}
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="muted">
          Sharing requires an account. Create a free account to share this list and sync
          it across devices.
        </p>
      </div>

      <button
        className="fab"
        aria-label="Add item"
        onClick={() => navigate(`/list/${list.id}/add-item`)}
      >
        <Icon name="plus" size={26} strokeWidth={2} />
      </button>
    </div>
  );
}
