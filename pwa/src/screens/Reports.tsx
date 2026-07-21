import { EmptyState } from "../components/EmptyState";

// Placeholder tab — real reports arrive in Phase 7.
export function Reports() {
  return (
    <EmptyState
      icon="chart"
      message="Complete a shopping trip to see your spending summary."
    />
  );
}
