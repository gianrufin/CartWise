// Default catalogs used across create/edit flows. In later phases these become
// per-user/household records (see docs/backend/schema-plan.sql).

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

// Currencies offered in the MVP. PHP-first; no automatic conversion.
export const currencies = [
  { code: "PHP", label: "Philippine Peso (₱)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
];
