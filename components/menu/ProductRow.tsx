import Image from "next/image";
import { formatPrice, validPrices } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Etiqueta "Agotado". */
export function SoldOutBadge() {
  return (
    <span className="inline-block rounded-sm bg-vermouth px-1.5 py-0.5 text-[0.7rem] font-semibold leading-none text-white">
      Agotado
    </span>
  );
}

/** Nombre del producto con su aclaración corta ("con fritas"). */
export function ProductTitle({ product }: { product: Product }) {
  return (
    <h3 className="text-[1.02rem] font-semibold leading-snug">
      {product.title}
      {product.note && (
        <span className="ml-1.5 text-sm font-normal text-ink-soft">{product.note.toLowerCase()}</span>
      )}
    </h3>
  );
}

/**
 * Un producto de una lista común.
 *  - Un precio:      Nombre ········· $ 9.000
 *  - Varios precios: Nombre, y debajo una fila por tamaño o combo
 *  - Sin precio:     Nombre ········· Consultar
 */
export function ProductRow({ product }: { product: Product }) {
  const soldOut = !product.is_available;
  const prices = validPrices(product.prices);
  const single = prices.length === 1 && !prices[0].label;
  const priceClass = `font-display font-bold whitespace-nowrap tabular-nums ${
    soldOut ? "line-through decoration-2" : ""
  }`;

  return (
    <li className={`flex gap-4 py-3.5 ${soldOut ? "opacity-55" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <ProductTitle product={product} />
          {(single || prices.length === 0) && <span className="leader" aria-hidden="true" />}
          {single && <span className={`text-lg ${priceClass}`}>{formatPrice(prices[0].price!)}</span>}
          {prices.length === 0 && <span className="text-sm text-ink-soft whitespace-nowrap">Consultar</span>}
        </div>

        {product.description && (
          <p className="mt-0.5 max-w-prose text-[0.93rem] leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {!single && prices.length > 0 && (
          <dl className="mt-1.5 space-y-1">
            {prices.map((p, i) => (
              <div key={i} className="flex items-baseline gap-2 text-[0.95rem]">
                <dt className="text-ink-soft">{p.label || `Opción ${i + 1}`}</dt>
                <span className="leader" aria-hidden="true" />
                <dd className={priceClass}>{formatPrice(p.price!)}</dd>
              </div>
            ))}
          </dl>
        )}

        {soldOut && (
          <div className="mt-1.5">
            <SoldOutBadge />
          </div>
        )}
      </div>

      {product.image_url && (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-line/40 sm:size-24">
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="96px"
            className={`object-cover ${soldOut ? "grayscale" : ""}`}
          />
        </div>
      )}
    </li>
  );
}
