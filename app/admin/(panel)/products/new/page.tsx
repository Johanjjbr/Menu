import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";
import { ListSkeleton } from "@/components/admin/ListSkeleton";

export const metadata = { title: "Nuevo producto" };

export default function NewProductPage() {
  return (
    <>
      <PageTitle>Nuevo producto</PageTitle>
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <NewProduct />
      </Suspense>
    </>
  );
}

async function NewProduct() {
  const { supabase } = await requireUser();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order")
    .order("name");

  if (!categories?.length) {
    return (
      <p className="text-ink-soft">
        Para cargar productos primero necesitás una categoría.{" "}
        <Link href="/admin/categories" className="font-semibold text-ink underline">
          Crear una categoría
        </Link>
      </p>
    );
  }

  return <ProductForm action={createProduct} categories={categories} submitLabel="Crear producto" />;
}
