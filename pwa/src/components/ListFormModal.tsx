import { useState } from "react";
import { currencies } from "../data/constants";
import type { ShoppingList } from "../data/types";
import { Icon } from "./Icon";

interface Props {
  // When editing, seed from an existing list; otherwise create.
  list?: ShoppingList;
  defaultCurrency?: string;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    currency: string;
    budgetAmount?: number;
    description?: string;
  }) => void;
  onDelete?: () => void;
}

export function ListFormModal({ list, defaultCurrency = "PHP", onClose, onSubmit, onDelete }: Props) {
  const [name, setName] = useState(list?.name ?? "");
  const [currency, setCurrency] = useState(list?.currency ?? defaultCurrency);
  const [budget, setBudget] = useState(
    list?.budgetAmount != null ? String(list.budgetAmount) : ""
  );
  const [description, setDescription] = useState(list?.description ?? "");

  const canSave = name.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    const parsedBudget = parseFloat(budget);
    onSubmit({
      name: name.trim(),
      currency,
      budgetAmount: Number.isNaN(parsedBudget) ? undefined : parsedBudget,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: "var(--space-sm)" }}>
          <h2 className="screen-title">{list ? "List settings" : "New list"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="list-name">List name</label>
          <input
            id="list-name"
            autoFocus
            placeholder="e.g. Weekly Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="list-currency">Currency</label>
            <select
              id="list-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="list-budget">Budget (optional)</label>
            <input
              id="list-budget"
              inputMode="decimal"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="list-desc">Description (optional)</label>
          <input
            id="list-desc"
            placeholder="e.g. Regular weekly run"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={!canSave} onClick={submit}>
          {list ? "Save changes" : "Create list"}
        </button>
        {list && onDelete && (
          <button className="btn btn-text btn-block danger-text" onClick={onDelete}>
            Delete list
          </button>
        )}
      </div>
    </div>
  );
}
