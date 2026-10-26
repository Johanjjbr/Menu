import { Suspense } from "react";
import { connection } from "next/server";
import { getMenu } from "@/lib/data/menu";
import { restaurant } from "@/lib/config";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { ProductRow } from "@/components/menu/ProductRow";

export const metadata = { title: "Menú" };

/**
 * Vista pública de la carta (/menu) — la que abre el QR.
 *
 * El encabezado es estático y se prerenderiza. La carta se consulta en
 * cada visita (await connection()) para que un precio o un "Agotado"
 * cambiado en el admin se vea al instante, sin esperar ningún cache.
 */
export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 pb-16">
      <header className="px-4 pt-10 pb-6 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="mt-2 text-lg text-ink-soft">{restaurant.tagline}</p>
        )}
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </main>
  );
}

async function MenuContent() {
  await connection(); // siempre datos frescos
  const menu = await getMenu();

  if (menu.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-ink-soft sm:px-6">
        La carta se está preparando. Volvé a mirar en un rato.
      </p>
    );
  }

  return (
    <>
      <CategoryNav categories={menu.map(({ id, name }) => ({ id, name }))} />

      <div className="mt-2 space-y-10 px-4 sm:px-6">
        {menu.map((category) => (
          <section key={category.id} id={`cat-${category.id}`} aria-labelledby={`h-${category.id}`}>
            <h2
              id={`h-${category.id}`}
              className="font-display text-2xl font-bold border-b-2 border-ink pb-1"
            >
              {category.name}
            </h2>
            <ul className="divide-y divide-line">
              {category.products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

/** Esqueleto mientras carga la carta (también va en el HTML estático). */
function MenuSkeleton() {
  return (
    <div className="animate-pulse px-4 sm:px-6" aria-label="Cargando la carta">
      <div className="flex gap-2 py-3">
        {[80, 104, 72, 92].map((w) => (
          <div key={w} className="h-9 rounded-full bg-line/60" style={{ width: w }} />
        ))}
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="mt-8 space-y-5">
          <div className="h-7 w-40 rounded bg-line/70" />
          {[0, 1, 2].map((r) => (
            <div key={r} className="space-y-2">
              <div className="h-5 w-full rounded bg-line/50" />
              <div className="h-4 w-2/3 rounded bg-line/40" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
