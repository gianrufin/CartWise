// PHP-first currency formatting per docs/design-tokens.md.
export function formatCurrency(
  amount: number,
  currency = "PHP",
  compact = false
): string {
  const symbol = currency === "PHP" ? "₱" : currency === "USD" ? "$" : `${currency} `;
  const isWhole = Number.isInteger(amount);
  const digits = compact && isWhole ? 0 : 2;
  return (
    symbol +
    amount.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}
