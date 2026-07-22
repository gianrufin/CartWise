import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { ListFormModal } from "../components/ListFormModal";
import { Segmented } from "../components/Segmented";
import { useAuth } from "../data/auth";
import { useStore } from "../data/store";
import { estimatedTotal, unresolvedCount } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function Lists() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lists, createList } = useStore();
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<"active" | "archived">("active");

  const active = lists.filter((l) => l.status === "active");
  const archived = lists.filter((l) => l.status === "archived");
  const shown = tab === "active" ? active : archived;

  return (
    <div className="screen">
      <h1 className="screen-title">Lists</h1>

      {archived.length > 0 && (
        <Segmented<"active" | "archived">
          ariaLabel="List filter"
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: `Active (${active.length})` },
            { value: "archived", label: `Archived (${archived.length})` },
          ]}
        />
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon="clipboard-list"
          message={
            tab === "archived"
              ? "No archived lists."
              : "Create your first grocery list and start tracking your budget."
          }
          actionLabel={tab === "archived" ? undefined : "New list"}
          onAction={tab === "archived" ? undefined : () => setCreating(true)}
        />
      ) : (
        shown.map((list) => (
          <div
            key={list.id}
            className="card clickable"
            onClick={() => navigate(`/list/${list.id}`)}
          >
            <div className="row">
              <div>
                <div className="amount">{list.name}</div>
                <div className="muted">
                  {unresolvedCount(list.items)} pending of {list.items.length} items
                  {list.shared ? " · shared" : ""}
                </div>
              </div>
              <span className="amount primary-text">
                {formatCurrency(estimatedTotal(list.items), list.currency, true)}
              </span>
            </div>
          </div>
        ))
      )}

      <button className="fab" aria-label="Create list" onClick={() => setCreating(true)}>
        <Icon name="plus" size={26} strokeWidth={2} />
      </button>

      {creating && (
        <ListFormModal
          defaultCurrency={user?.defaultCurrency}
          onClose={() => setCreating(false)}
          onSubmit={(values) => {
            const id = createList(values);
            setCreating(false);
            navigate(`/list/${id}`);
          }}
        />
      )}
    </div>
  );
}
