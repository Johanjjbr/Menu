"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import type { ActionState, Product } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { Field, FormError, inputClass, buttonPrimary, buttonSecondary } from "./ui";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  product?: Product;
  submitLabel: string;
};

/**
 * Formulario de producto (crear y editar).
 *
 * La foto se sube a Storage desde el navegador (ImageUpload) y el
 * formulario solo envía la URL resultante en un campo oculto.
 */
export function ProductForm({ action, categories, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [uploading, setUploading] = useState(false);

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-[1fr_220px]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-4">
        <Field label="Nombre" htmlFor="title">
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={product?.title}
            placeholder="Ej: Milanesa napolitana"
            className={inputClass}
          />
        </Field>

        <Field label="Descripción" htmlFor="description" hint="Opcional. Ingredientes, tamaño, guarnición.">
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio" htmlFor="price" hint="Ej: 12800 o 1250,50">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft">
                $
              </span>
              <input
                id="price"
                name="price"
                inputMode="decimal"
                required
                defaultValue={product ? String(product.price).replace(".", ",") : ""}
                className={`${inputClass} pl-7 tabular-nums`}
              />
            </div>
          </Field>

          <Field label="Categoría" htmlFor="category_id">
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={product?.category_id ?? categories[0]?.id}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-3 rounded-lg border-2 border-line bg-card px-3 py-3">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={product?.is_available ?? true}
            className="size-5 accent-[var(--ink)]"
          />
          <span>
            <span className="block font-semibold">Disponible</span>
            <span className="text-sm text-ink-soft">Si lo desmarcás aparece como &quot;Agotado&quot; en la carta.</span>
          </span>
        </label>
      </div>

      <ImageUpload initialUrl={product?.image_url ?? null} onUploadingChange={setUploading} />

      <div className="space-y-3 md:col-span-2">
        <FormError message={state?.error} />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending || uploading} className={buttonPrimary}>
            <Save className="size-4" aria-hidden />
            {pending ? "Guardando…" : uploading ? "Esperando la foto…" : submitLabel}
          </button>
          <Link href="/admin" className={buttonSecondary}>
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
