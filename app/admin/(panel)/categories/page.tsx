import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";
import { CategoryCreateForm, CategoryRow } from "@/components/admin/CategoryForms";

export const metadata = { title: "Categorías" };

/** /admin/categories — crear, renombrar, reordenar y borrar categorías. */
export default function CategoriesPage() {
  return (
    <>
      <PageTitle>Categorías</PageTitle>
      <p className="-mt-4 mb-6 text-ink-soft">
        El orden de esta lista es el orden en que aparecen en la carta.
      </p>
      <CategoryCreateForm />
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <CategoryList />
      </Suspense>
    </>
  );
}

async function CategoryList() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, products(count)")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(error.message);
  const categories = data ?? [];

  if (categories.length === 0) {
    return <p className="mt-6 text-ink-soft">Todavía no hay categorías. Creá la primera arriba.</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
      {categories.map((c, i) => (
        <CategoryRow
          key={c.id}
          id={c.id}
          name={c.name}
          // PostgREST devuelve el conteo como [{ count: n }]
          productCount={(c.products as unknown as { count: number }[])[0]?.count ?? 0}
          isFirst={i === 0}
          isLast={i === categories.length - 1}
        />
      ))}
    </ul>
  );
}
