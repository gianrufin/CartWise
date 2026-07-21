import type { CompletedTrip, ShoppingList } from "./types";

// Phase 0 mock data. Replaced by IndexedDB-backed local storage in Phase 1.

export const defaultCategories = [
  "Produce",
  "Meat and Seafood",
  "Dairy",
  "Pantry",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
  "Baby and Kids",
  "Pets",
  "Pharmacy",
  "Other",
];

export const defaultStores = [
  "SM Supermarket",
  "Wet Market",
  "Mercury Drug",
  "Bakery",
  "Sari-sari Store",
  "Other",
];

export const defaultUnits = ["pc", "kg", "g", "L", "mL", "pack", "tray", "dozen", "sack"];

export const mockLists: ShoppingList[] = [
  {
    id: "list-1",
    name: "Weekly Groceries",
    description: "Regular weekly run",
    currency: "PHP",
    budgetAmount: 3000,
    items: [
      {
        id: "item-1",
        listId: "list-1",
        name: "Rice",
        quantity: 5,
        unit: "kg",
        estimatedUnitPrice: 70,
        estimatedTotalPrice: 350,
        actualTotalPrice: 370,
        category: "Pantry",
        store: "SM Supermarket",
        priority: "essential",
        status: "purchased",
      },
      {
        id: "item-2",
        listId: "list-1",
        name: "Eggs",
        quantity: 1,
        unit: "tray",
        estimatedTotalPrice: 240,
        actualTotalPrice: 250,
        category: "Dairy",
        store: "SM Supermarket",
        priority: "essential",
        status: "purchased",
      },
      {
        id: "item-3",
        listId: "list-1",
        name: "Chicken",
        quantity: 1,
        unit: "kg",
        estimatedTotalPrice: 220,
        category: "Meat and Seafood",
        store: "Wet Market",
        priority: "essential",
        status: "unavailable",
      },
      {
        id: "item-4",
        listId: "list-1",
        name: "Bananas",
        quantity: 1,
        unit: "kg",
        estimatedTotalPrice: 90,
        category: "Produce",
        store: "Wet Market",
        priority: "normal",
        status: "pending",
      },
      {
        id: "item-5",
        listId: "list-1",
        name: "Dish soap",
        notes: "Any brand on promo",
        quantity: 1,
        unit: "pc",
        estimatedTotalPrice: 65,
        category: "Household",
        store: "SM Supermarket",
        priority: "optional",
        status: "pending",
      },
      {
        id: "item-6",
        listId: "list-1",
        name: "Instant coffee",
        quantity: 2,
        unit: "pack",
        estimatedUnitPrice: 55,
        estimatedTotalPrice: 110,
        category: "Beverages",
        store: "Sari-sari Store",
        priority: "normal",
        status: "carried_over",
      },
    ],
  },
  {
    id: "list-2",
    name: "Birthday Party",
    description: "For Saturday",
    currency: "PHP",
    budgetAmount: 1500,
    items: [
      {
        id: "item-7",
        listId: "list-2",
        name: "Spaghetti pasta",
        quantity: 2,
        unit: "pack",
        estimatedUnitPrice: 60,
        estimatedTotalPrice: 120,
        category: "Pantry",
        store: "SM Supermarket",
        priority: "normal",
        status: "pending",
      },
      {
        id: "item-8",
        listId: "list-2",
        name: "Cake",
        quantity: 1,
        unit: "pc",
        estimatedTotalPrice: 600,
        category: "Snacks",
        store: "Bakery",
        priority: "essential",
        status: "pending",
      },
    ],
  },
];

export const listById = (id: string | undefined): ShoppingList =>
  mockLists.find((l) => l.id === id) ?? mockLists[0];

export const mockTrips: CompletedTrip[] = [
  {
    id: "trip-1",
    listName: "Weekly Groceries",
    currency: "PHP",
    budgetAmount: 3000,
    actualTotal: 620,
    paymentMethod: "cash",
    completedAtLabel: "Jul 18, 2026",
    purchasedCount: 2,
    unavailableCount: 1,
    skippedCount: 0,
    carriedOverCount: 1,
  },
  {
    id: "trip-2",
    listName: "Pantry Restock",
    currency: "PHP",
    budgetAmount: 2000,
    actualTotal: 2180,
    paymentMethod: "gcash",
    completedAtLabel: "Jul 11, 2026",
    purchasedCount: 12,
    unavailableCount: 0,
    skippedCount: 2,
    carriedOverCount: 0,
  },
];

export const tripById = (id: string | undefined): CompletedTrip =>
  mockTrips.find((t) => t.id === id) ?? mockTrips[0];

export const monthSpendingTotal = mockTrips.reduce((sum, t) => sum + t.actualTotal, 0);
