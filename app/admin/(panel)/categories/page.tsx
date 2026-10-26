import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { MENU_GROUPS, type CategoryKind } from "@/lib/types";
import { PageTitle } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";
import { CategoryCreateForm, CategoryRow } from "@/components/admin/CategoryForms";
import { BulkPriceForm } from "@/components/admin/BulkPriceForm";

export const metadata = { title: "Categorías" };

/** /admin/categories — categorías por grupo y aumento masivo de precios. */
export default function CategoriesPage() {
  return (
    <>
      <PageTitle>Categorías</PageTitle>
      <p className="-mt-4 mb-6 text-ink-soft">
        El orden de cada grupo es el orden en que aparecen en la carta.
      </p>
      <CategoryCreateForm />
      <Suspense fallback={<ListSkeleton rows={5} />}>
        <CategoryList />
      </Suspense>
    </>
  );
}

async function CategoryList() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, menu_group, kind, price_columns, products(count)")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(error.message);
  const categories = data ?? [];

  if (categories.length === 0) {
    return <p className="mt-6 text-ink-soft">Todavía no hay categorías. Creá la primera arriba.</p>;
  }

  return (
    <>
      <div className="mt-8 space-y-8">
        {MENU_GROUPS.map((group) => {
          const items = categories.filter((c) => c.menu_group === group.id);
          if (items.length === 0) return null;
          return (
            <section key={group.id}>
              <h2 className="mb-2 font-display text-xl font-bold">{group.label}</h2>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                {items.map((c, i) => (
                  <CategoryRow
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    kind={c.kind as CategoryKind}
                    priceColumns={c.price_columns}
                    // PostgREST devuelve el conteo como [{ count: n }]
                    productCount={(c.products as unknown as { count: number }[])[0]?.count ?? 0}
                    isFirst={i === 0}
                    isLast={i === items.length - 1}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <BulkPriceForm categories={categories.map(({ id, name }) => ({ id, name }))} />
    </>
  );
}
