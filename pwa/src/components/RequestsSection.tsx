import { useCallback, useEffect, useState } from "react";
import { roleCan, type Role } from "../data/permissions";
import {
  createRequest,
  listRequests,
  setRequestStatus,
  type ItemRequest,
} from "../data/cloud/requests";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/currency";
import { Icon } from "./Icon";

interface Props {
  listId: string;
  currency: string;
  role: Role | undefined;
  user: { id: string; displayName: string };
}

// Phase 10: item requests. Owners review pending requests (approve → becomes a
// list item, or decline). Request-only members submit requests and see status.
export function RequestsSection({ listId, currency, role, user }: Props) {
  const { addItem } = useStore();
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [composing, setComposing] = useState(false);

  const canReview = roleCan(role, "manageMembers"); // owner
  const canRequest = roleCan(role, "submitRequests"); // request_only

  const refresh = useCallback(() => {
    listRequests(listId).then(setRequests).catch(() => {});
  }, [listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!canReview && !canRequest) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const mine = requests.filter((r) => r.requestedByUserId === user.id);

  const approve = async (r: ItemRequest) => {
    addItem(listId, {
      name: r.name,
      quantity: r.quantity,
      notes: r.notes,
      estimatedTotalPrice: r.estimatedPrice,
      priority: "normal",
    });
    await setRequestStatus(r.id, "approved");
    refresh();
  };

  return (
    <div>
      <h2 className="section-title">Requests</h2>

      {canReview && (
        pending.length === 0 ? (
          <div className="card">
            <p className="muted">No pending requests.</p>
          </div>
        ) : (
          pending.map((r) => (
            <div key={r.id} className="card" style={{ display: "grid", gap: "var(--space-sm)" }}>
              <div className="row">
                <div>
                  <div className="amount">{r.name}</div>
                  <div className="muted">
                    {r.quantity} · {r.requestedByName || "member"}
                    {r.estimatedPrice != null
                      ? ` · ~${formatCurrency(r.estimatedPrice, currency, true)}`
                      : ""}
                  </div>
                  {r.notes && <div className="muted">{r.notes}</div>}
                </div>
              </div>
              <div className="field-row">
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => approve(r)}>
                  Approve
                </button>
                <button
                  className="btn btn-outline"
                  onClick={async () => {
                    await setRequestStatus(r.id, "declined");
                    refresh();
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )
      )}

      {canRequest && (
        <>
          {mine.map((r) => (
            <div key={r.id} className="card">
              <div className="row">
                <div>
                  <div>{r.name}</div>
                  <div className="muted">{r.quantity}</div>
                </div>
                <span className={`badge ${r.status === "approved" ? "shared" : ""}`}>{r.status}</span>
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-block" onClick={() => setComposing(true)}>
            Request an item
          </button>
        </>
      )}

      {composing && (
        <RequestModal
          currency={currency}
          onClose={() => setComposing(false)}
          onSubmit={async (values) => {
            await createRequest({
              listId,
              requestedByUserId: user.id,
              requestedByName: user.displayName,
              ...values,
            });
            setComposing(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function RequestModal({
  currency,
  onClose,
  onSubmit,
}: {
  currency: string;
  onClose: () => void;
  onSubmit: (v: { name: string; quantity: number; notes?: string; estimatedPrice?: number }) => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: "var(--space-sm)" }}>
          <h2 className="screen-title">Request an item</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="field">
          <label htmlFor="req-name">Item name</label>
          <input id="req-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="req-qty">Quantity</label>
            <input id="req-qty" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="req-price">Est. price ({currency})</label>
            <input id="req-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="req-notes">Notes</label>
          <input id="req-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button
          className="btn btn-primary btn-block"
          disabled={!name.trim()}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              quantity: parseFloat(quantity) || 1,
              notes: notes.trim() || undefined,
              estimatedPrice: price.trim() ? parseFloat(price) : undefined,
            })
          }
        >
          Send request
        </button>
      </div>
    </div>
  );
}
