/**
 * Formatea un precio en pesos argentinos.
 * 12800 → "$ 12.800"   ·   1250.5 → "$ 1.250,50"
 */
const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | string) {
  const n = Number(value);
  // Si tiene centavos los mostramos con dos decimales; si no, sin decimales.
  if (!Number.isInteger(n)) {
    return n.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });
  }
  return priceFormatter.format(n);
}
