import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageOff, AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { priceSummary } from "@/lib/format";
import { MENU_GROUPS, type CategoryWithProducts } from "@/lib/types";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/app/admin/actions";
import { PageTitle, buttonPrimary, iconButton } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";

export const metadata = { title: "Productos" };

/**
 * /admin — productos por grupo y categoría, con toggle de disponibilidad.
 * ?revisar=1 muestra solo los productos marcados "Precio a revisar".
 */
export default function ProductsPage({ searchParams }: PageProps<"/admin">) {
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

      {/* Lee la sesión y la URL → dentro de Suspense */}
      <Suspense fallback={<ListSkeleton />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductList({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const onlyReview = (await searchParams).revisar === "1";
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("categories")
    .select("*, products(*)")
    .order("sort_order")
    .order("name")
    .order("sort_order", { referencedTable: "products" })
    .order("title", { referencedTable: "products" });

  if (error) throw new Error(error.message);
  const all = (data ?? []) as CategoryWithProducts[];

  if (all.length === 0) {
    return (
      <EmptyState>
        Primero creá una categoría (por ejemplo &quot;Cafetería&quot;) y después cargá los productos.{" "}
        <Link href="/admin/categories" className="font-semibold underline">
          Crear categorías
        </Link>
      </EmptyState>
    );
  }

  const reviewCount = all.reduce((n, c) => n + c.products.filter((p) => p.needs_review).length, 0);
  const categories = onlyReview
    ? all
        .map((c) => ({ ...c, products: c.products.filter((p) => p.needs_review) }))
        .filter((c) => c.products.length > 0)
    : all;

  return (
    <>
      {/* Aviso / filtro de productos a revisar */}
      {(reviewCount > 0 || onlyReview) && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
          <AlertTriangle className="size-5 shrink-0 text-vermouth" aria-hidden />
          <p className="flex-1 text-sm">
            {onlyReview
              ? `Mostrando ${reviewCount} ${reviewCount === 1 ? "producto" : "productos"} con precio a revisar.`
              : `${reviewCount} ${reviewCount === 1 ? "producto tiene" : "productos tienen"} el precio a revisar.`}
          </p>
          <Link href={onlyReview ? "/admin" : "/admin?revisar=1"} className="text-sm font-semibold underline">
            {onlyReview ? "Ver todos" : "Ver solo esos"}
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {MENU_GROUPS.map((group) => {
          const groupCats = categories.filter((c) => c.menu_group === group.id);
          if (groupCats.length === 0) return null;
          return (
            <div key={group.id} className="space-y-6">
              <h2 className="font-display text-2xl font-bold">{group.label}</h2>
              {groupCats.map((category) => (
                <section key={category.id}>
                  <h3 className="mb-2 font-semibold">
                    {category.name}{" "}
                    <span className="text-sm font-medium text-ink-soft">({category.products.length})</span>
                  </h3>

                  {category.products.length === 0 ? (
                    <p className="rounded-lg border-2 border-dashed border-line px-4 py-3 text-sm text-ink-soft">
                      Sin productos en esta categoría.
                    </p>
                  ) : (
                    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                      {category.products.map((p) => (
                        <li key={p.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                          <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-lg bg-line/40 sm:block">
                            {p.image_url ? (
                              <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                              <ImageOff className="m-auto mt-3.5 size-5 text-ink-soft/60" aria-hidden />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">
                              {p.title}
                              {p.needs_review && (
                                <span className="ml-2 rounded-sm bg-vermouth/15 px-1.5 py-0.5 align-middle text-[0.7rem] font-semibold text-vermouth">
                                  Revisar
                                </span>
                              )}
                            </p>
                            <p className="truncate text-sm tabular-nums text-ink-soft">{priceSummary(p.prices)}</p>
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
        })}
      </div>
    </>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-line px-4 py-8 text-center text-ink-soft">
      {children}
    </p>
  );
}
