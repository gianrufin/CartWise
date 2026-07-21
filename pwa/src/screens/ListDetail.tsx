import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ListFormModal } from "../components/ListFormModal";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../data/auth";
import { useStore } from "../data/store";
import { estimatedTotal } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const { getList, updateList, deleteList } = useStore();
  const list = getList(listId);
  const [editing, setEditing] = useState(false);
  const [shareBlocked, setShareBlocked] = useState(false);

  if (!list) {
    return (
      <div>
        <TopBar title="List" />
        <div className="screen">
          <p className="muted">This list no longer exists.</p>
          <button className="btn btn-outline" onClick={() => navigate("/lists")}>
            Back to lists
          </button>
        </div>
      </div>
    );
  }

  const estimate = estimatedTotal(list.items);
  const remaining = (list.budgetAmount ?? 0) - estimate;
  const grouped = new Map<string, typeof list.items>();
  for (const item of list.items) {
    const key = item.category ?? "Other";
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return (
    <div>
      <TopBar title={list.name}>
        <button
          className="icon-btn"
          aria-label="List settings"
          onClick={() => setEditing(true)}
        >
          <Icon name="settings" size={18} />
        </button>
      </TopBar>

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
                {list.budgetAmount != null
                  ? formatCurrency(Math.abs(remaining), list.currency, true)
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="field-row">
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={list.items.length === 0}
            onClick={() => navigate(`/list/${list.id}/shopping`)}
          >
            Start shopping
          </button>
          <button
            className="btn btn-outline"
            aria-label="Share list"
            onClick={() => setShareBlocked(true)}
          >
            Share
          </button>
        </div>

        {list.items.length === 0 && (
          <div className="card">
            <p className="muted">
              No items yet. Tap + to add your first item, set an estimated price, and
              you're ready to shop.
            </p>
          </div>
        )}

        {[...grouped.entries()].map(([category, items]) => (
          <div key={category}>
            <h2 className="section-title" style={{ marginBottom: "var(--space-sm)" }}>
              {category}
            </h2>
            <div className="card" style={{ padding: 0 }}>
              {items.map((item, i) => (
                <div key={item.id}>
                  <div
                    className="row clickable"
                    style={{ padding: "var(--space-md) var(--space-lg)" }}
                    onClick={() => navigate(`/list/${list.id}/item/${item.id}`)}
                  >
                    <div>
                      <div>{item.name}</div>
                      <div className="muted">
                        {trimQty(item.quantity)}
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
      </div>

      <button
        className="fab"
        aria-label="Add item"
        onClick={() => navigate(`/list/${list.id}/add-item`)}
      >
        <Icon name="plus" size={26} strokeWidth={2} />
      </button>

      {editing && (
        <ListFormModal
          list={list}
          onClose={() => setEditing(false)}
          onSubmit={(values) => {
            updateList(list.id, values);
            setEditing(false);
          }}
          onDelete={() => {
            deleteList(list.id);
            navigate("/lists");
          }}
        />
      )}

      {shareBlocked && (
        <div className="modal-scrim" onClick={() => setShareBlocked(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2 className="screen-title">
              {isGuest ? "Sharing needs an account" : "Sharing is almost here"}
            </h2>
            <p className="muted">
              {isGuest
                ? "Create a free account to share this list and sync it across devices. Guest lists stay on this device only."
                : "Your lists are on your account. Inviting collaborators and live shared shopping arrive in the next update (Phase 4)."}
            </p>
            <button className="btn btn-primary btn-block" onClick={() => setShareBlocked(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const trimQty = (q: number): string => (Number.isInteger(q) ? String(q) : String(q));
