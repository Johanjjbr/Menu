import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CategoryEditForm } from "@/components/admin/CategoryEditForm";
import { PageTitle } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";

export const metadata = { title: "Editar categoría" };

/** /admin/categories/[id] — nombre, grupo, formato, columnas de precio, nota y foto. */
export default function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  return (
    <>
      <PageTitle>Editar categoría</PageTitle>
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <EditCategory params={params} />
      </Suspense>
    </>
  );
}

async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (!category) notFound();
  return <CategoryEditForm category={category} />;
}
