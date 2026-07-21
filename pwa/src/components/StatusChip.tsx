import type { ItemStatus } from "../data/types";
import { STATUS_LABELS } from "../data/types";

const STATUS_VARS: Record<ItemStatus, string> = {
  pending: "var(--status-pending)",
  purchased: "var(--status-purchased)",
  unavailable: "var(--status-unavailable)",
  skipped: "var(--status-skipped)",
  carried_over: "var(--status-carried-over)",
};

export function StatusChip({ status }: { status: ItemStatus }) {
  const color = STATUS_VARS[status];
  return (
    <span
      className="status-chip"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
