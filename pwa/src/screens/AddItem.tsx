import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { defaultCategories, defaultStores } from "../data/constants";
import { useStore } from "../data/store";
import { derivePrices, type ItemPriority } from "../data/types";

const priorities: { value: ItemPriority; label: string }[] = [
  { value: "essential", label: "Essential" },
  { value: "normal", label: "Normal" },
  { value: "optional", label: "Optional" },
];

/**
 * Add / edit an item. Saves to the local store.
 * Price behaviour (per blueprint): enter unit price or total price and the
 * other is calculated from quantity; if both are entered and disagree, warn
 * and let the user pick which one to keep.
 */
export function AddItem() {
  const { listId, itemId } = useParams();
  const navigate = useNavigate();
  const { getList, addItem, updateItem, deleteItem } = useStore();
  const list = getList(listId);
  const existing = list?.items.find((i) => i.id === itemId);
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1));
  const [unit, setUnit] = useState(existing?.unit ?? "");
  const [unitPrice, setUnitPrice] = useState(
    existing?.estimatedUnitPrice != null ? String(existing.estimatedUnitPrice) : ""
  );
  const [totalPrice, setTotalPrice] = useState(
    existing?.estimatedTotalPrice != null ? String(existing.estimatedTotalPrice) : ""
  );
  const [store, setStore] = useState<string | null>(existing?.store ?? null);
  const [category, setCategory] = useState<string | null>(existing?.category ?? null);
  const [priority, setPriority] = useState<ItemPriority>(existing?.priority ?? "normal");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  if (!list) {
    return (
      <div>
        <TopBar title="Add item" />
        <div className="screen">
          <p className="muted">This list no longer exists.</p>
        </div>
      </div>
    );
  }

  const qty = parseFloat(quantity) || 1;
  const up = unitPrice.trim() === "" ? undefined : parseFloat(unitPrice);
  const tp = totalPrice.trim() === "" ? undefined : parseFloat(totalPrice);
  const derived = derivePrices({ quantity: qty, unitPrice: up, totalPrice: tp });
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const values = {
      name: name.trim(),
      quantity: qty,
      unit: unit.trim() || undefined,
      estimatedUnitPrice: derived.unitPrice,
      estimatedTotalPrice: derived.totalPrice,
      store: store ?? undefined,
      category: category ?? undefined,
      priority,
      notes: notes.trim() || undefined,
    };
    if (isEdit && existing) {
      updateItem(list.id, existing.id, values);
    } else {
      addItem(list.id, values);
    }
    navigate(-1);
  };

  return (
    <div>
      <TopBar title={isEdit ? "Edit item" : `Add item · ${list.name}`}>
        {isEdit && existing && (
          <button
            className="icon-btn"
            aria-label="Delete item"
            onClick={() => {
              deleteItem(list.id, existing.id);
              navigate(-1);
            }}
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </TopBar>

      <div className="screen">
        <div className="field">
          <label htmlFor="item-name">Item name</label>
          <input
            id="item-name"
            autoFocus={!isEdit}
            placeholder="e.g. Rice"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="item-qty">Quantity</label>
            <input
              id="item-qty"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="item-unit">Unit (kg, pc…)</label>
            <input
              id="item-unit"
              placeholder="kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="item-unit-price">Unit price ({symbol(list.currency)})</label>
            <input
              id="item-unit-price"
              inputMode="decimal"
              placeholder="0.00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="item-total-price">Total price ({symbol(list.currency)})</label>
            <input
              id="item-total-price"
              inputMode="decimal"
              placeholder="0.00"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
            />
          </div>
        </div>

        {derived.mismatch && (
          <div className="warn-banner">
            <span>
              Unit × quantity ({symbol(list.currency)}
              {(up! * qty).toFixed(2)}) doesn't match the total you entered. Which
              should we keep?
            </span>
            <div className="chip-row">
              <button
                className="chip"
                onClick={() => setTotalPrice(String((up! * qty).toFixed(2)))}
              >
                Use unit price
              </button>
              <button
                className="chip"
                onClick={() => setUnitPrice(String((tp! / qty).toFixed(2)))}
              >
                Use total price
              </button>
            </div>
          </div>
        )}

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
          <textarea
            id="item-notes"
            placeholder="Any brand on promo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={!canSave} onClick={save}>
          {isEdit ? "Save item" : "Add item"}
        </button>
      </div>
    </div>
  );
}

const symbol = (currency: string): string =>
  currency === "PHP" ? "₱" : currency === "USD" ? "$" : currency + " ";
