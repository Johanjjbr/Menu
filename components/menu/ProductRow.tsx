import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Un plato de la carta: nombre ····· precio, descripción debajo y foto
 * opcional a la derecha. Si está agotado se muestra atenuado, con el
 * precio tachado y la etiqueta "Agotado".
 */
export function ProductRow({ product }: { product: Product }) {
  const soldOut = !product.is_available;

  return (
    <li className={`flex gap-4 py-4 ${soldOut ? "opacity-60" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[1.05rem] font-semibold leading-snug">{product.title}</h3>
          <span className="leader" aria-hidden="true" />
          <span
            className={`font-display text-lg font-bold whitespace-nowrap tabular-nums ${
              soldOut ? "line-through decoration-2" : ""
            }`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {product.description && (
          <p className="mt-1 max-w-prose text-[0.95rem] leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {soldOut && (
          <span className="mt-2 inline-block rounded-sm bg-vermouth px-2 py-0.5 text-xs font-semibold text-white">
            Agotado
          </span>
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
