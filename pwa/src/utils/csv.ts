import type { Trip } from "../data/types.ts";
import { PAYMENT_LABELS } from "../data/types.ts";

// CSV export of completed trips (Phase 9). Pure string builder + a browser
// download helper. Only purchased spending is recorded on trips, so the export
// matches in-app report totals.

function escapeCell(value: string | number | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function tripsToCsv(trips: Trip[]): string {
  const header = [
    "Date",
    "List",
    "Currency",
    "Budget",
    "Actual total",
    "Over/under",
    "Payment method",
    "Purchased",
    "Unavailable",
    "Skipped",
    "Carried over",
  ];
  const rows = trips.map((t) => [
    new Date(t.completedAt).toISOString().slice(0, 10),
    t.listName,
    t.currency,
    t.budgetAmount ?? "",
    t.actualTotal,
    t.budgetAmount != null ? t.budgetAmount - t.actualTotal : "",
    PAYMENT_LABELS[t.paymentMethod],
    t.purchasedCount,
    t.unavailableCount,
    t.skippedCount,
    t.carriedOverCount,
  ]);
  return [header, ...rows].map((r) => r.map(escapeCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
