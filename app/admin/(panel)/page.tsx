import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { CategoryWithProducts } from "@/lib/types";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/app/admin/actions";
import { PageTitle, buttonPrimary, iconButton } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";

export const metadata = { title: "Productos" };

/** /admin — listado de productos por categoría con toggle de disponibilidad. */
export default function ProductsPage() {
  return (
    <>
      <PageTitle
        action={
          <Link href="/admin/products/new" className={buttonPrimary}>
            <Plus className="size-4" aria-hidden /> Nuevo producto
          </Link>
        }
      >
        Productos
      </PageTitle>

      {/* Lee la sesión (cookies) → tiene que ir dentro de Suspense */}
      <Suspense fallback={<ListSkeleton />}>
        <ProductList />
      </Suspense>
    </>
  );
}

async function ProductList() {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("categories")
    .select("*, products(*)")
    .order("sort_order")
    .order("name")
    .order("title", { referencedTable: "products" });

  if (error) throw new Error(error.message);
  const categories = (data ?? []) as CategoryWithProducts[];

  if (categories.length === 0) {
    return (
      <EmptyState>
        Primero creá una categoría (por ejemplo &quot;Entradas&quot;) y después cargá los productos.{" "}
        <Link href="/admin/categories" className="font-semibold underline">
          Crear categorías
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category.id}>
          <h2 className="mb-2 font-display text-xl font-bold">
            {category.name}{" "}
            <span className="font-sans text-sm font-medium text-ink-soft">
              ({category.products.length})
            </span>
          </h2>

          {category.products.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed border-line px-4 py-3 text-sm text-ink-soft">
              Sin productos en esta categoría.
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
              {category.products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-line/40">
                    {p.image_url ? (
                      <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <ImageOff className="m-auto mt-3.5 size-5 text-ink-soft/60" aria-hidden />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.title}</p>
                    <p className="text-sm tabular-nums text-ink-soft">{formatPrice(p.price)}</p>
                  </div>

                  <AvailabilityToggle id={p.id} title={p.title} available={p.is_available} />

                  <Link href={`/admin/products/${p.id}`} className={iconButton} aria-label={`Editar ${p.title}`}>
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <DeleteButton
                    action={deleteProduct.bind(null, p.id)}
                    label={`Borrar ${p.title}`}
                    confirmText={`¿Borrar "${p.title}"? No se puede deshacer.`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-line px-4 py-8 text-center text-ink-soft">
      {children}
    </p>
  );
}
