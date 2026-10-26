import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { updateProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";

export const metadata = { title: "Editar producto" };

/** /admin/products/[id] — editar un producto existente. */
export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <>
      <PageTitle>Editar producto</PageTitle>
      {/* params y la sesión son datos de request → dentro de Suspense */}
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <EditProduct params={params} />
      </Suspense>
    </>
  );
}

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order").order("name"),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      action={updateProduct}
      categories={categories ?? []}
      product={product}
      submitLabel="Guardar cambios"
    />
  );
}
