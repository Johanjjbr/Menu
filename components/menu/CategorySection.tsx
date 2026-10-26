import Image from "next/image";
import { formatNumber, formatPrice, validPrices } from "@/lib/format";
import type { CategoryWithProducts, Product } from "@/lib/types";
import { ProductRow, ProductTitle, SoldOutBadge } from "./ProductRow";

/**
 * Una sección de la carta. Elige el formato según la categoría:
 *  - kind "daily"           → tarjeta destacada (Menú del día)
 *  - kind "promo"           → tarjetas de combos
 *  - con price_columns      → tabla de tamaños (pizzas, gaseosas, cervezas)
 *  - resto                  → lista común
 */
export function CategorySection({ category }: { category: CategoryWithProducts }) {
  const body =
    category.kind === "daily" ? (
      <ul className="divide-y divide-line">
        {category.products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </ul>
    ) : category.kind === "promo" ? (
      <PromoGrid products={category.products} />
    ) : category.price_columns.length > 0 ? (
      <SizeTable columns={category.price_columns} products={category.products} />
    ) : (
      <ul className="divide-y divide-line">
        {category.products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </ul>
    );

  const isDaily = category.kind === "daily";

  return (
    <section
      id={`cat-${category.id}`}
      aria-labelledby={`h-${category.id}`}
      className={
        isDaily
          ? "rounded-2xl border border-line border-l-4 border-l-brand bg-card px-4 pt-4 pb-1 sm:px-5"
          : ""
      }
    >
      <header className={`flex items-center gap-3 ${isDaily ? "" : "border-b-2 border-ink pb-1.5"}`}>
        {category.image_url && (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand ring-offset-2 ring-offset-paper">
            <Image src={category.image_url} alt="" fill sizes="48px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <h2 id={`h-${category.id}`} className="font-display text-2xl font-bold leading-tight">
            {category.name}
          </h2>
          {category.note && <p className="text-sm text-ink-soft">{category.note}</p>}
        </div>
      </header>
      {body}
    </section>
  );
}

/** Tabla con una columna por tamaño. Los precios extra (combos) van debajo del nombre. */
function SizeTable({ columns, products }: { columns: string[]; products: Product[] }) {
  // Con muchas columnas achicamos un poco los números para que entren en el celular
  const compact = columns.length >= 4;
  return (
    <table className={`mt-1 w-full border-collapse text-left ${compact ? "[&_td]:text-[0.92rem]" : ""}`}>
      <caption className="sr-only">Precios en pesos por tamaño</caption>
      <thead>
        <tr className="text-xs text-ink-soft">
          <th scope="col" className="py-2 font-medium">
            <span className="sr-only">Producto</span>
          </th>
          {columns.map((c) => (
            <th key={c} scope="col" className="py-2 pl-2 text-right font-medium whitespace-nowrap">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line border-t border-line">
        {products.map((p) => {
          const prices = validPrices(p.prices);
          const extras = prices.filter((x) => !columns.includes(x.label));
          const soldOut = !p.is_available;
          return (
            <tr key={p.id} className={soldOut ? "opacity-55" : ""}>
              <th scope="row" className="py-3 pr-2 align-top font-normal">
                <ProductTitle product={p} />
                {p.description && <p className="text-sm text-ink-soft">{p.description}</p>}
                {extras.map((x, i) => (
                  <p key={i} className="text-sm text-ink-soft">
                    {x.label}: <span className="font-semibold text-ink">{formatPrice(x.price!)}</span>
                  </p>
                ))}
                {prices.length === 0 && <p className="text-sm text-ink-soft">Consultar precio</p>}
                {soldOut && (
                  <div className="mt-1">
                    <SoldOutBadge />
                  </div>
                )}
              </th>
              {columns.map((c) => {
                const cell = prices.find((x) => x.label === c);
                return (
                  <td
                    key={c}
                    className={`py-3 pl-2 text-right align-top font-display font-bold tabular-nums whitespace-nowrap ${
                      soldOut && cell ? "line-through" : ""
                    }`}
                  >
                    {cell ? formatNumber(cell.price!) : <span className="font-sans font-normal text-line">—</span>}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Promos como tarjetas: el combo y su precio bien visible. */
function PromoGrid({ products }: { products: Product[] }) {
  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
      {products.map((p) => {
        const prices = validPrices(p.prices);
        const soldOut = !p.is_available;
        return (
          <li
            key={p.id}
            className={`flex flex-col justify-between gap-3 rounded-xl border border-line bg-card p-4 ${
              soldOut ? "opacity-55" : ""
            }`}
          >
            <div>
              <ProductTitle product={p} />
              {p.description && <p className="mt-0.5 text-sm text-ink-soft">{p.description}</p>}
            </div>
            <div className="flex items-end justify-between gap-2">
              {soldOut ? <SoldOutBadge /> : <span />}
              <span className="text-right">
                {prices.length === 0 ? (
                  <span className="text-sm text-ink-soft">Consultar</span>
                ) : (
                  prices.map((x, i) => (
                    <span key={i} className="block">
                      {x.label && <span className="mr-1.5 text-sm text-ink-soft">{x.label}</span>}
                      <span
                        className={`font-display text-xl font-bold tabular-nums ${soldOut ? "line-through" : ""}`}
                      >
                        {formatPrice(x.price!)}
                      </span>
                    </span>
                  ))
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
