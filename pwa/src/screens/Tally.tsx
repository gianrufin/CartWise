import { useState } from "react";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { useTally } from "../data/tally";
import { formatCurrency } from "../utils/currency";

// Budget proximity states reuse the system palette: normal (cyan), near budget
// (amber, >=85%), and over budget (red) — matching Shopping Mode's warnings.
type BudgetState = "normal" | "near" | "over";

const STATE_STYLE: Record<BudgetState, { bg: string; ink: string; sub: string }> = {
  normal: { bg: "var(--accent-cyan-grad)", ink: "#06222e", sub: "#06343f" },
  near: { bg: "linear-gradient(135deg,#f6c453,#ef9d2b)", ink: "#3a2600", sub: "#523600" },
  over: { bg: "linear-gradient(135deg,#f87171,#dc2626)", ink: "#ffffff", sub: "rgba(255,255,255,0.9)" },
};

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "back"];

/**
 * Quick Tally — the persistent grocery calculator.
 * Prices are entered with an on-screen keypad (no device keyboard pops up),
 * stacking onto a live running total. An optional budget shows how close you
 * are, colorising the total amber as you near it and red once you go over.
 * Entries + budget persist across reloads.
 */
export function Tally() {
  const { entries, budget, add, remove, clear, setBudget, total } = useTally();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);

  const value = parseFloat(amount);
  const canAdd = !Number.isNaN(value) && value > 0;

  const submit = () => {
    if (!canAdd) return;
    add(value, name);
    setAmount("");
    setName("");
  };

  const press = (k: string) => {
    if (k === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (k === ".") {
      setAmount((a) => (a.includes(".") ? a : a === "" ? "0." : a + "."));
      return;
    }
    setAmount((a) => {
      // Guard: max 2 decimal places, and avoid leading-zero runs.
      const dot = a.indexOf(".");
      if (dot >= 0 && a.length - dot > 2) return a;
      if (a === "0") return k; // replace a lone leading zero
      return a + k;
    });
  };

  // Budget proximity state + colors.
  const ratio = budget && budget > 0 ? total / budget : 0;
  const state: BudgetState =
    budget == null ? "normal" : total > budget ? "over" : ratio >= 0.85 ? "near" : "normal";
  const style = STATE_STYLE[state];
  const remaining = (budget ?? 0) - total;
  const pct = budget && budget > 0 ? Math.min(100, (total / budget) * 100) : 0;

  return (
    <div className="tally">
      <TopBar title="Quick Tally" />

      <div className="tally-total" style={{ background: style.bg, color: style.ink }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="caption" style={{ color: style.ink }}>
              Running total
            </div>
            <div className="total-value">{formatCurrency(total, "PHP", true)}</div>
          </div>
          <button
            className="tally-budget-btn"
            style={{ color: style.ink, borderColor: style.ink }}
            onClick={() => setEditingBudget(true)}
          >
            {budget == null ? "Set budget" : "Edit"}
          </button>
        </div>

        {budget != null && (
          <>
            <div className="tally-progress">
              <div
                className="tally-progress-fill"
                style={{ width: `${pct}%`, background: style.ink }}
              />
            </div>
            <div className="row">
              <span className="total-meta" style={{ color: style.sub }}>
                budget {formatCurrency(budget, "PHP", true)}
              </span>
              <span className="total-meta" style={{ color: style.ink, fontWeight: 700 }}>
                {remaining >= 0
                  ? `${formatCurrency(remaining, "PHP", true)} left`
                  : `over by ${formatCurrency(-remaining, "PHP", true)}`}
              </span>
            </div>
          </>
        )}
        {budget == null && (
          <div className="total-meta" style={{ color: style.sub }}>
            {entries.length} {entries.length === 1 ? "item" : "items"} · names optional
          </div>
        )}
      </div>

      <div className="tally-tape">
        {entries.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "var(--space-lg)" }}>
            Tap the keypad to add prices — no need to name anything. Your total
            stays saved even if you close the app.
          </p>
        )}
        {entries.map((entry, i) => (
          <div key={entry.id} className="tape-row">
            <span className="index">{i + 1}</span>
            <span className={`name ${entry.name ? "" : "unnamed"}`}>{entry.name ?? "Item"}</span>
            <span className="amount">{formatCurrency(entry.amount, "PHP", true)}</span>
            <button className="remove" aria-label="Remove entry" onClick={() => remove(entry.id)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="tally-pad">
        <div className="pad-entry-row">
          <div className="pad-amount" aria-label="Current price">
            <span className="cur">₱</span>
            <span className={amount ? "" : "ph"}>{amount || "0"}</span>
          </div>
          <button className="pad-add" onClick={submit} disabled={!canAdd} aria-label="Add price">
            <Icon name="plus" size={26} strokeWidth={2.2} />
          </button>
        </div>
        <input
          className="pad-name"
          placeholder="Item name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label="Item name (optional)"
        />
        <div className="keypad">
          {KEYS.map((k) => (
            <button key={k} className="key" onClick={() => press(k)} aria-label={k === "back" ? "Backspace" : k}>
              {k === "back" ? <Icon name="arrow-left" size={20} /> : k}
            </button>
          ))}
        </div>
        {entries.length > 0 && (
          <button className="link-btn danger" onClick={clear}>
            Clear all
          </button>
        )}
      </div>

      {editingBudget && (
        <BudgetModal
          current={budget}
          onClose={() => setEditingBudget(false)}
          onSave={(b) => {
            setBudget(b);
            setEditingBudget(false);
          }}
        />
      )}
    </div>
  );
}

function BudgetModal({
  current,
  onClose,
  onSave,
}: {
  current?: number;
  onClose: () => void;
  onSave: (b: number | undefined) => void;
}) {
  const [text, setText] = useState(current != null ? String(current) : "");
  const parsed = parseFloat(text);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: "var(--space-sm)" }}>
          <h2 className="screen-title">Tally budget</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="muted">Get an amber warning as you near it, and red once you go over.</p>
        <div className="field">
          <label htmlFor="tally-budget">Budget (₱)</label>
          <input
            id="tally-budget"
            inputMode="decimal"
            autoFocus
            placeholder="e.g. 3000"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !Number.isNaN(parsed) && onSave(parsed)}
          />
        </div>
        <button
          className="btn btn-primary btn-block"
          disabled={Number.isNaN(parsed) || parsed <= 0}
          onClick={() => onSave(parsed)}
        >
          Save budget
        </button>
        {current != null && (
          <button className="btn btn-text btn-block danger-text" onClick={() => onSave(undefined)}>
            Remove budget
          </button>
        )}
      </div>
    </div>
  );
}
