import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Segmented } from "../components/Segmented";
import { useAuth } from "../data/auth";
import { isPremium } from "../data/entitlements";
import { useStore } from "../data/store";
import { PAYMENT_LABELS } from "../data/types";
import { formatCurrency } from "../utils/currency";
import { downloadCsv, tripsToCsv } from "../utils/csv";
import { formatDate } from "../utils/date";
import {
  filterByRange,
  RANGE_LABELS,
  spendingByList,
  spendingByPaymentMethod,
  summarize,
  type DateRange,
} from "../utils/reports";

// Phase 7 reports + Phase 9 export. Free users get this month's basics;
// premium unlocks date ranges, breakdowns, and CSV export.
export function Reports() {
  const navigate = useNavigate();
  const { trips: allTrips } = useStore();
  const { user } = useAuth();
  const premium = isPremium(user);
  const [range, setRange] = useState<DateRange>("month");

  const trips = useMemo(
    () => filterByRange(allTrips, premium ? range : "month"),
    [allTrips, range, premium]
  );
  const summary = useMemo(() => summarize(trips), [trips]);
  const byList = useMemo(() => spendingByList(trips), [trips]);
  const byPayment = useMemo(() => spendingByPaymentMethod(trips), [trips]);

  if (allTrips.length === 0) {
    return (
      <EmptyState icon="chart" message="Complete a shopping trip to see your spending summary." />
    );
  }

  const maxListTotal = Math.max(1, ...byList.map((b) => b.total));

  return (
    <div className="screen">
      <div className="row">
        <h1 className="screen-title">Reports</h1>
        <button
          className="btn btn-outline"
          style={{ minHeight: 40, padding: "0 var(--space-lg)" }}
          onClick={() => {
            if (!premium) return navigate("/subscription");
            downloadCsv(`cartwise-spending-${range}.csv`, tripsToCsv(trips));
          }}
        >
          {premium ? "Export CSV" : "Export (Premium)"}
        </button>
      </div>

      {premium ? (
        <Segmented<DateRange>
          ariaLabel="Date range"
          value={range}
          onChange={setRange}
          options={(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => ({
            value: r,
            label: RANGE_LABELS[r],
          }))}
        />
      ) : (
        <div
          className="card clickable"
          onClick={() => navigate("/subscription")}
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
        >
          <p className="muted">
            You're seeing <strong style={{ color: "var(--text)" }}>this month</strong>. Upgrade
            for date ranges, store & payment breakdowns, full history, and CSV export.
          </p>
        </div>
      )}

      <div className="card hero">
        <div className="caption" style={{ color: "rgba(255,255,255,0.85)" }}>
          {premium ? RANGE_LABELS[range] : "This month"}
        </div>
        <div className="amount-lg">{formatCurrency(summary.total, "PHP", true)}</div>
        <div style={{ font: "var(--font-body-sm)", opacity: 0.9 }}>
          {summary.tripCount} {summary.tripCount === 1 ? "trip" : "trips"} · avg{" "}
          {formatCurrency(summary.avgPerTrip, "PHP", true)}
        </div>
      </div>

      {summary.budgetTotal > 0 && (
        <div className="card">
          <div className="row">
            <span className="muted">Budgeted</span>
            <span className="amount">{formatCurrency(summary.budgetTotal, "PHP", true)}</span>
          </div>
          <hr className="divider" style={{ margin: "var(--space-sm) 0" }} />
          <div className="row">
            <span className="muted">{summary.overUnder >= 0 ? "Under budget" : "Over budget"}</span>
            <span className={`amount ${summary.overUnder >= 0 ? "positive-text" : "danger-text"}`}>
              {formatCurrency(Math.abs(summary.overUnder), "PHP", true)}
            </span>
          </div>
        </div>
      )}

      <h2 className="section-title">Spending by list</h2>
      <div className="card" style={{ display: "grid", gap: "var(--space-md)" }}>
        {byList.map((b) => (
          <div key={b.key}>
            <div className="row">
              <span>{b.label}</span>
              <span className="amount">{formatCurrency(b.total, "PHP", true)}</span>
            </div>
            <div className="tally-progress" style={{ marginTop: 6 }}>
              <div
                className="tally-progress-fill"
                style={{ width: `${(b.total / maxListTotal) * 100}%`, background: "var(--accent)" }}
              />
            </div>
          </div>
        ))}
      </div>

      {premium ? (
        <>
          <h2 className="section-title">Spending by payment method</h2>
          <div className="card" style={{ padding: 0 }}>
            {byPayment.map((b, i) => (
              <div key={b.key}>
                <div className="row" style={{ padding: "var(--space-md) var(--space-lg)" }}>
                  <span>{b.label}</span>
                  <span className="amount">{formatCurrency(b.total, "PHP", true)}</span>
                </div>
                {i < byPayment.length - 1 && <hr className="divider" />}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card clickable" onClick={() => navigate("/subscription")}>
          <p className="muted">
            🔒 Payment-method and store breakdowns are a premium feature.
          </p>
        </div>
      )}

      <h2 className="section-title">Recent trips</h2>
      {trips.slice(0, 20).map((t) => (
        <div key={t.id} className="card clickable" onClick={() => navigate(`/trip/${t.id}`)}>
          <div className="row">
            <div>
              <div>{t.listName}</div>
              <div className="muted">
                {formatDate(t.completedAt)} · {PAYMENT_LABELS[t.paymentMethod]}
              </div>
            </div>
            <span className="amount">{formatCurrency(t.actualTotal, t.currency, true)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
