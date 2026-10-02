/** Amounts come from the API as whole cents: 500 with "usd" is "$5.00". */
export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
    amountCents / 100,
  );
}
