import { useRef, useState } from "react";
import { TopBar } from "../components/TopBar";
import { useTally } from "../data/tally";
import { formatCurrency } from "../utils/currency";

/**
 * Quick Tally — the persistent grocery calculator.
 * Punch in a price, tap +, and it stacks onto a running total. The item name
 * is optional. Entries and total persist across reloads (localStorage), so you
 * can keep a live running total the whole time you walk the store.
 */
export function Tally() {
  const { entries, add, remove, clear, total } = useTally();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const priceRef = useRef<HTMLInputElement>(null);

  const value = parseFloat(amount);
  const canAdd = !Number.isNaN(value) && value !== 0;

  const submit = () => {
    if (!canAdd) return;
    add(value, name);
    setAmount("");
    setName("");
    priceRef.current?.focus();
  };

  return (
    <div className="tally">
      <TopBar title="Quick Tally" />

      <div className="tally-total">
        <div className="caption" style={{ color: "inherit" }}>
          Running total
        </div>
        <div className="total-value">{formatCurrency(total, "PHP", true)}</div>
        <div className="total-meta">
          {entries.length} {entries.length === 1 ? "item" : "items"} · names optional
        </div>
      </div>

      <div className="tally-tape">
        {entries.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
            Add prices as you shop — no need to name anything. Your running total
            stays saved even if you close the app.
          </p>
        )}
        {entries.map((entry, i) => (
          <div key={entry.id} className="tape-row">
            <span className="index">{i + 1}</span>
            <span className={`name ${entry.name ? "" : "unnamed"}`}>
              {entry.name ?? "Item"}
            </span>
            <span className="amount">{formatCurrency(entry.amount, "PHP", true)}</span>
            <button
              className="remove"
              aria-label="Remove entry"
              onClick={() => remove(entry.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="tally-entry">
        <div className="entry-inputs">
          <input
            ref={priceRef}
            className="price-input"
            inputMode="decimal"
            placeholder="₱ 0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            aria-label="Price"
          />
          <button className="add-btn" onClick={submit} disabled={!canAdd} aria-label="Add price">
            +
          </button>
        </div>
        <input
          className="name-input"
          placeholder="Item name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          aria-label="Item name (optional)"
        />
        <div className="entry-actions">
          <span className="caption">Tap + or press Enter to stack</span>
          {entries.length > 0 && (
            <button className="link-btn danger" onClick={clear}>
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
