import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { ListFormModal } from "../components/ListFormModal";
import { useAuth } from "../data/auth";
import { useStore } from "../data/store";
import { estimatedTotal, unresolvedCount } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function Lists() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLists, createList } = useStore();
  const [creating, setCreating] = useState(false);

  return (
    <div className="screen">
      <div className="row">
        <h1 className="screen-title">Lists</h1>
      </div>

      {activeLists.length === 0 ? (
        <EmptyState
          icon="clipboard-list"
          message="Create your first grocery list and start tracking your budget."
          actionLabel="New list"
          onAction={() => setCreating(true)}
        />
      ) : (
        activeLists.map((list) => (
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
