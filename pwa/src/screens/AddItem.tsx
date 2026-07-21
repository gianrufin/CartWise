import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { defaultCategories, defaultStores, listById } from "../data/mock";
import type { ItemPriority } from "../data/types";

const priorities: { value: ItemPriority; label: string }[] = [
  { value: "essential", label: "Essential" },
  { value: "normal", label: "Normal" },
  { value: "optional", label: "Optional" },
];

/**
 * Add/Edit item form. Phase 0: layout + local state only (nothing is saved).
 * Unit price ↔ total price auto-calculation lands with real persistence in Phase 1.
 */
export function AddItem() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = listById(listId);

  const [store, setStore] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<ItemPriority>("normal");

  return (
    <div>
      <TopBar title={`Add item · ${list.name}`} />
      <form
        className="screen"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
      >
        <div className="field">
          <label htmlFor="item-name">Item name</label>
          <input id="item-name" placeholder="e.g. Rice" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="item-qty">Quantity</label>
            <input id="item-qty" inputMode="decimal" defaultValue="1" />
          </div>
          <div className="field">
            <label htmlFor="item-unit">Unit (kg, pc…)</label>
            <input id="item-unit" placeholder="kg" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="item-unit-price">Unit price (₱)</label>
            <input id="item-unit-price" inputMode="decimal" placeholder="0.00" />
          </div>
          <div className="field">
            <label htmlFor="item-total-price">Total price (₱)</label>
            <input id="item-total-price" inputMode="decimal" placeholder="0.00" />
          </div>
        </div>

        <h2 className="section-title">Store</h2>
        <div className="chip-row">
          {defaultStores.map((option) => (
            <button
              type="button"
              key={option}
              className={`chip ${store === option ? "selected" : ""}`}
              onClick={() => setStore(store === option ? null : option)}
            >
              {option}
            </button>
          ))}
        </div>

        <h2 className="section-title">Category</h2>
        <div className="chip-row">
          {defaultCategories.map((option) => (
            <button
              type="button"
              key={option}
              className={`chip ${category === option ? "selected" : ""}`}
              onClick={() => setCategory(category === option ? null : option)}
            >
              {option}
            </button>
          ))}
        </div>

        <h2 className="section-title">Priority</h2>
        <div className="chip-row">
          {priorities.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`chip ${priority === option.value ? "selected" : ""}`}
              onClick={() => setPriority(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="field">
          <label htmlFor="item-notes">Notes</label>
          <textarea id="item-notes" placeholder="Any brand on promo" />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Save item
        </button>
      </form>
    </div>
  );
}
