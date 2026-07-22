import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ItemPhoto } from "../components/ItemPhoto";
import { ListFormModal } from "../components/ListFormModal";
import { RequestsSection } from "../components/RequestsSection";
import { ShareModal } from "../components/ShareModal";
import { StatusChip } from "../components/StatusChip";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../data/auth";
import { isCloudConfigured } from "../data/config";
import { roleCan, ROLE_LABELS } from "../data/permissions";
import { useStore } from "../data/store";
import { estimatedTotal } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { isGuest, user } = useAuth();
  const { getList, updateList, deleteList, duplicateList, setListArchived } = useStore();
  const list = getList(listId);
  const [editing, setEditing] = useState(false);
  const [shareBlocked, setShareBlocked] = useState(false);
  const [sharing, setSharing] = useState(false);

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

  const canManage = roleCan(list.role, "changeBudget"); // owner-level
  const canAddItems = roleCan(list.role, "addItems");
  const canEditItems = roleCan(list.role, "editItems");
  const canShare = roleCan(list.role, "manageMembers") && isCloudConfigured;

  const openShare = () => {
    if (isGuest) setShareBlocked(true);
    else if (canShare) setSharing(true);
    else setShareBlocked(true);
  };

  return (
    <div>
      <TopBar title={list.name}>
        {canManage && (
          <button
            className="icon-btn"
            aria-label="List settings"
            onClick={() => setEditing(true)}
          >
            <Icon name="settings" size={18} />
          </button>
        )}
      </TopBar>

      <div className="screen">
        {isCloudConfigured && !isGuest && (
          <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
            <span className={`badge ${list.shared ? "shared" : ""}`}>
              <Icon name={list.shared ? "users" : "lock"} size={13} />
              {list.shared ? "Shared" : "Private"}
            </span>
            {list.shared && (
              <span className="caption">you're {ROLE_LABELS[list.role ?? "viewer"]}</span>
            )}
          </div>
        )}
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
          <button className="btn btn-outline" aria-label="Share list" onClick={openShare}>
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

        {isCloudConfigured && list.shared && user && (
          <RequestsSection
            listId={list.id}
            currency={list.currency}
            role={list.role}
            user={{ id: user.id, displayName: user.displayName }}
          />
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
                    className={`row ${canEditItems ? "clickable" : ""}`}
                    style={{ padding: "var(--space-md) var(--space-lg)" }}
                    onClick={
                      canEditItems
                        ? () => navigate(`/list/${list.id}/item/${item.id}`)
                        : undefined
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", minWidth: 0 }}>
                      {item.photoUrl && <ItemPhoto path={item.photoUrl} size={40} />}
                      <div style={{ minWidth: 0 }}>
                        <div>{item.name}</div>
                        <div className="muted">
                          {trimQty(item.quantity)}
                          {item.unit ? ` ${item.unit}` : ""}
                          {item.store ? ` · ${item.store}` : ""}
                        </div>
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

      {canAddItems && (
        <button
          className="fab"
          aria-label="Add item"
          onClick={() => navigate(`/list/${list.id}/add-item`)}
        >
          <Icon name="plus" size={26} strokeWidth={2} />
        </button>
      )}

      {sharing && user && (
        <ShareModal
          listId={list.id}
          currentUserId={user.id}
          onClose={() => setSharing(false)}
        />
      )}

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
          onDuplicate={() => {
            const id = duplicateList(list.id);
            setEditing(false);
            if (id) navigate(`/list/${id}`);
          }}
          onArchive={() => {
            setListArchived(list.id, list.status !== "archived");
            setEditing(false);
            navigate("/lists");
          }}
        />
      )}

      {shareBlocked && (
        <div className="modal-scrim" onClick={() => setShareBlocked(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2 className="screen-title">
              {isGuest
                ? "Sharing needs an account"
                : !isCloudConfigured
                ? "Sharing needs the cloud"
                : "Only the owner can invite"}
            </h2>
            <p className="muted">
              {isGuest
                ? "Create a free account to share this list and sync it across devices. Guest lists stay on this device only."
                : !isCloudConfigured
                ? "This build isn't connected to a cloud backend, so lists stay on this device."
                : "You're a collaborator on this shared list. Ask the owner to change roles or invite others."}
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
