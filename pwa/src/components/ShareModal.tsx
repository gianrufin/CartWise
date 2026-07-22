import { useEffect, useState } from "react";
import type { Member } from "../data/types";
import { INVITABLE_ROLES, ROLE_LABELS, type Role } from "../data/permissions";
import {
  createInvite,
  listMembers,
  removeMember,
  updateMemberRole,
  updateMemberSpending,
} from "../data/cloud/sharing";
import { Icon } from "./Icon";

// Free tier: one collaborator per shared list (blueprint). Premium raises this.
const FREE_COLLABORATOR_LIMIT = 1;

interface Props {
  listId: string;
  currentUserId: string;
  onClose: () => void;
}

export function ShareModal({ listId, currentUserId, onClose }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteRole, setInviteRole] = useState<Role>("shopper");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = () =>
    listMembers(listId)
      .then(setMembers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const atLimit = members.length >= FREE_COLLABORATOR_LIMIT;

  const invite = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await createInvite(listId, inviteRole, currentUserId);
      setInviteUrl(res.url);
      try {
        await navigator.clipboard.writeText(res.url);
        setCopied(true);
      } catch {
        /* clipboard may be blocked; the link is shown to copy manually */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: "var(--space-sm)" }}>
          <h2 className="screen-title">Share list</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="caption">People with access</div>
        <div className="card" style={{ padding: 0 }}>
          <div className="row" style={{ padding: "var(--space-md) var(--space-lg)" }}>
            <div>
              <div>You</div>
              <div className="muted">Owner</div>
            </div>
          </div>
          {loading && <div className="muted" style={{ padding: "0 var(--space-lg) var(--space-md)" }}>Loading…</div>}
          {members.map((m) => (
            <div key={m.userId}>
              <hr className="divider" />
              <div className="row" style={{ padding: "var(--space-md) var(--space-lg)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.displayName || m.email || "Collaborator"}
                  </div>
                  <div className="muted">{m.email}</div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
                  <select
                    className="settings-select"
                    style={{ margin: 0, width: "auto", minHeight: 40 }}
                    value={m.role}
                    onChange={async (e) => {
                      await updateMemberRole(listId, m.userId, e.target.value as Role);
                      void refresh();
                    }}
                  >
                    {INVITABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    className="icon-btn"
                    aria-label="Remove"
                    onClick={async () => {
                      await removeMember(listId, m.userId);
                      void refresh();
                    }}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </div>
              <label className="spending-toggle">
                <input
                  type="checkbox"
                  checked={m.canViewSpending ?? true}
                  onChange={async (e) => {
                    await updateMemberSpending(listId, m.userId, e.target.checked);
                    void refresh();
                  }}
                />
                Can see spending (actual prices &amp; totals)
              </label>
            </div>
          ))}
        </div>

        {atLimit ? (
          <div className="card">
            <p className="muted">
              Free plan includes {FREE_COLLABORATOR_LIMIT} collaborator. Upgrade to
              invite more people, use advanced roles, and share more lists.
            </p>
          </div>
        ) : (
          <>
            <div className="caption">Invite someone</div>
            <div className="chip-row">
              {INVITABLE_ROLES.map((r) => (
                <button
                  key={r}
                  className={`chip ${inviteRole === r ? "selected" : ""}`}
                  onClick={() => setInviteRole(r)}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-block" disabled={busy} onClick={invite}>
              {busy ? "Creating link…" : "Create invite link"}
            </button>
          </>
        )}

        {inviteUrl && (
          <div className="card">
            <div className="caption">{copied ? "Link copied — share it" : "Share this link"}</div>
            <div className="muted" style={{ wordBreak: "break-all", marginTop: 4 }}>{inviteUrl}</div>
          </div>
        )}
        {error && <div className="warn-banner danger-banner">{error}</div>}
      </div>
    </div>
  );
}
