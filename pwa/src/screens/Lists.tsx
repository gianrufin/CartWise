import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { mockLists } from "../data/mock";
import { estimatedTotal, isResolved } from "../data/types";
import { formatCurrency } from "../utils/currency";

export function Lists() {
  const navigate = useNavigate();

  if (mockLists.length === 0) {
    return (
      <EmptyState
        icon="📝"
        message="Create your first grocery list and start tracking your budget."
      />
    );
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Lists</h1>
      {mockLists.map((list) => {
        const pending = list.items.filter((i) => !isResolved(i)).length;
        return (
          <div
            key={list.id}
            className="card clickable"
            onClick={() => navigate(`/list/${list.id}`)}
          >
            <div className="row">
              <div>
                <div className="amount">{list.name}</div>
                <div className="muted">
                  {pending} pending of {list.items.length} items
                </div>
              </div>
              <span className="amount primary-text">
                {formatCurrency(estimatedTotal(list.items), list.currency, true)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
