import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ItemStatus,
  ListItem,
  PaymentMethod,
  ShoppingList,
  Trip,
} from "./types";

// Phase 1: local guest-mode persistence. All data lives on-device in
// localStorage — no account, no cloud. Cloud sync + guest→account migration
// arrive in Phase 3. The shape mirrors docs/backend/schema-plan.sql so the
// migration is a straight mapping later.

const STORAGE_KEY = "cartwise.store.v1";

interface PersistedState {
  lists: ShoppingList[];
  trips: Trip[];
}

const EMPTY: PersistedState = { lists: [], trips: [] };

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      lists: Array.isArray(parsed.lists) ? parsed.lists : [],
      trips: Array.isArray(parsed.trips) ? parsed.trips : [],
    };
  } catch {
    return EMPTY;
  }
}

export interface NewListInput {
  name: string;
  currency: string;
  budgetAmount?: number;
  description?: string;
}

export type ItemInput = Omit<ListItem, "id" | "listId" | "status"> &
  Partial<Pick<ListItem, "status">>;

interface StoreApi {
  lists: ShoppingList[];
  trips: Trip[];
  activeLists: ShoppingList[];
  monthSpendingTotal: number;

  getList: (id: string | undefined) => ShoppingList | undefined;
  getTrip: (id: string | undefined) => Trip | undefined;

  createList: (input: NewListInput) => string;
  updateList: (id: string, patch: Partial<Omit<ShoppingList, "id" | "items">>) => void;
  deleteList: (id: string) => void;

  addItem: (listId: string, item: ItemInput) => void;
  updateItem: (listId: string, itemId: string, patch: Partial<ListItem>) => void;
  deleteItem: (listId: string, itemId: string) => void;

  // Completes a trip from the list's current item states, records history,
  // and returns the new trip id. Carried-over items are kept on the list.
  completeTrip: (listId: string, paymentMethod: PaymentMethod) => string;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Non-fatal: data just won't persist if storage is unavailable.
    }
  }, [state]);

  const getList = useCallback(
    (id: string | undefined) => state.lists.find((l) => l.id === id),
    [state.lists]
  );

  const getTrip = useCallback(
    (id: string | undefined) => state.trips.find((t) => t.id === id),
    [state.trips]
  );

  const createList = useCallback((input: NewListInput) => {
    const id = uid("list");
    const list: ShoppingList = {
      id,
      name: input.name.trim() || "Untitled list",
      description: input.description?.trim() || undefined,
      currency: input.currency,
      budgetAmount: input.budgetAmount,
      status: "active",
      createdAt: new Date().toISOString(),
      items: [],
    };
    setState((s) => ({ ...s, lists: [list, ...s.lists] }));
    return id;
  }, []);

  const updateList = useCallback(
    (id: string, patch: Partial<Omit<ShoppingList, "id" | "items">>) => {
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      }));
    },
    []
  );

  const deleteList = useCallback((id: string) => {
    setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== id) }));
  }, []);

  const addItem = useCallback((listId: string, item: ItemInput) => {
    const newItem: ListItem = {
      id: uid("item"),
      listId,
      status: item.status ?? "pending",
      priority: item.priority ?? "normal",
      quantity: item.quantity ?? 1,
      name: item.name,
      notes: item.notes,
      unit: item.unit,
      estimatedUnitPrice: item.estimatedUnitPrice,
      estimatedTotalPrice: item.estimatedTotalPrice,
      actualUnitPrice: item.actualUnitPrice,
      actualTotalPrice: item.actualTotalPrice,
      category: item.category,
      store: item.store,
    };
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId ? { ...l, items: [...l.items, newItem] } : l
      ),
    }));
  }, []);

  const updateItem = useCallback(
    (listId: string, itemId: string, patch: Partial<ListItem>) => {
      setState((s) => ({
        ...s,
        lists: s.lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((it) =>
                  it.id === itemId ? { ...it, ...patch } : it
                ),
              }
            : l
        ),
      }));
    },
    []
  );

  const deleteItem = useCallback((listId: string, itemId: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? { ...l, items: l.items.filter((it) => it.id !== itemId) }
          : l
      ),
    }));
  }, []);

  const completeTrip = useCallback((listId: string, paymentMethod: PaymentMethod) => {
    const tripId = uid("trip");
    setState((s) => {
      const list = s.lists.find((l) => l.id === listId);
      if (!list) return s;

      const purchased = list.items.filter((i) => i.status === "purchased");
      const actual = purchased.reduce((sum, i) => sum + (i.actualTotalPrice ?? 0), 0);
      const trip: Trip = {
        id: tripId,
        listId,
        listName: list.name,
        currency: list.currency,
        budgetAmount: list.budgetAmount,
        actualTotal: actual,
        paymentMethod,
        completedAt: new Date().toISOString(),
        purchasedCount: purchased.length,
        unavailableCount: list.items.filter((i) => i.status === "unavailable").length,
        skippedCount: list.items.filter((i) => i.status === "skipped").length,
        carriedOverCount: list.items.filter((i) => i.status === "carried_over").length,
      };

      // After a trip: resolved items are cleared out; carried-over items stay
      // on the list (reset to pending) so the next trip can pick them up.
      const remainingItems = list.items
        .filter((i) => i.status === "carried_over")
        .map((i) => ({
          ...i,
          status: "pending" as ItemStatus,
          actualUnitPrice: undefined,
          actualTotalPrice: undefined,
        }));

      return {
        lists: s.lists.map((l) =>
          l.id === listId ? { ...l, items: remainingItems } : l
        ),
        trips: [trip, ...s.trips],
      };
    });
    return tripId;
  }, []);

  const value = useMemo<StoreApi>(() => {
    const activeLists = state.lists.filter((l) => l.status === "active");
    const now = new Date();
    const monthSpendingTotal = state.trips
      .filter((t) => {
        const d = new Date(t.completedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, t) => sum + t.actualTotal, 0);

    return {
      lists: state.lists,
      trips: state.trips,
      activeLists,
      monthSpendingTotal,
      getList,
      getTrip,
      createList,
      updateList,
      deleteList,
      addItem,
      updateItem,
      deleteItem,
      completeTrip,
    };
  }, [
    state,
    getList,
    getTrip,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    completeTrip,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
