import type { ListItem } from "../data/types";
import { actualTotal, estimatedTotal } from "../data/types";

export type GroupBy = "category" | "store" | "none";

export interface ItemGroup {
  key: string;
  label: string;
  items: ListItem[];
  estimated: number;
  actual: number;
}

// Group items for display. `none` returns a single unlabelled group.
// Groups are ordered by first appearance; the "Other" bucket sorts last.
export function groupItems(items: ListItem[], by: GroupBy): ItemGroup[] {
  if (by === "none") {
    return [
      {
        key: "all",
        label: "",
        items,
        estimated: estimatedTotal(items),
        actual: actualTotal(items),
      },
    ];
  }

  const order: string[] = [];
  const buckets = new Map<string, ListItem[]>();
  for (const item of items) {
    const label = (by === "store" ? item.store : item.category) ?? "Other";
    if (!buckets.has(label)) {
      buckets.set(label, []);
      order.push(label);
    }
    buckets.get(label)!.push(item);
  }

  order.sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return 0;
  });

  return order.map((label) => {
    const groupItems = buckets.get(label)!;
    return {
      key: label,
      label,
      items: groupItems,
      estimated: estimatedTotal(groupItems),
      actual: actualTotal(groupItems),
    };
  });
}
