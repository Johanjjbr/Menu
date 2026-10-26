import type { PriceItem } from "./types";

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

/** 12800 → "$ 12.800"   ·   1250.5 → "$ 1.250,50" */
export function formatPrice(value: number | string) {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
  }
  return currency.format(n);
}

/** Igual pero sin "$", para las tablas de tamaños: 12800 → "12.800" */
export function formatNumber(value: number | string) {
  return plain.format(Number(value));
}

/** Precios que tienen valor (descarta los vacíos). */
export function validPrices(prices: PriceItem[] | null | undefined) {
  return (prices ?? []).filter((p) => typeof p.price === "number");
}

/** Resumen corto para listados del admin: "$ 3.000 – $ 3.600" o "Sin precio". */
export function priceSummary(prices: PriceItem[]) {
  const values = validPrices(prices).map((p) => p.price as number);
  if (values.length === 0) return "Sin precio";
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

/**
 * Convierte el precio escrito por el usuario a número.
 *   "12800" → 12800   "12.800" → 12800   "1.250,50" → 1250.5   "1250.50" → 1250.5
 * Devuelve null si está vacío y NaN si no es válido.
 */
export function parsePrice(raw: string): number | null {
  const clean = raw.replace(/[$\s]/g, "");
  if (!clean) return null;
  if (clean.includes(",")) return Number(clean.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(clean)) return Number(clean.replace(/\./g, ""));
  return Number(clean);
}
