"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Save, X, Columns3 } from "lucide-react";
import type { ActionState, Product } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { Field, FormError, inputClass, buttonPrimary, buttonSecondary, iconButton } from "./ui";

type CategoryOption = { id: string; name: string; price_columns: string[] };
type PriceRow = { key: number; label: string; value: string };

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: CategoryOption[];
  product?: Product;
  submitLabel: string;
};

let nextKey = 0;
const row = (label = "", value = ""): PriceRow => ({ key: nextKey++, label, value });

/** Filas iniciales: las del producto, o las columnas de la categoría, o un precio único. */
function initialRows(product: Product | undefined, category: CategoryOption | undefined) {
  if (product && product.prices.length > 0) {
    return product.prices.map((p) => row(p.label, p.price == null ? "" : String(p.price).replace(".", ",")));
  }
  if (category && category.price_columns.length > 0) return category.price_columns.map((c) => row(c));
  return [row()];
}

/**
 * Formulario de producto (crear y editar).
 *
 * Precios: una fila por tamaño o combo (etiqueta + precio). Si la
 * categoría tiene columnas (ej. Entera / Media), las filas se arman solas.
 * La foto se sube a Storage desde el navegador y viaja como URL.
 */
export function ProductForm({ action, categories, product, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [uploading, setUploading] = useState(false);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const category = categories.find((c) => c.id === categoryId);
  const [rows, setRows] = useState<PriceRow[]>(() => initialRows(product, category));

  const update = (key: number, patch: Partial<PriceRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function changeCategory(id: string) {
    setCategoryId(id);
    const next = categories.find((c) => c.id === id);
    // Si todavía no cargó ningún precio, adapta las filas a la nueva categoría
    if (rows.every((r) => !r.value.trim())) {
      setRows(next && next.price_columns.length > 0 ? next.price_columns.map((c) => row(c)) : [row()]);
    }
  }

  const columnsMissing =
    category &&
    category.price_columns.length > 0 &&
    category.price_columns.some((c) => !rows.some((r) => r.label === c));

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría" htmlFor="category_id">
            <select
              id="category_id"
              name="category_id"
              required
              value={categoryId}
              onChange={(e) => changeCategory(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Aclaración" htmlFor="note" hint="Opcional. Ej: con fritas, copón.">
            <input id="note" name="note" maxLength={60} defaultValue={product?.note ?? ""} className={inputClass} />
          </Field>
        </div>

        <Field label="Descripción" htmlFor="description" hint="Opcional. Ingredientes, tamaño, guarnición.">
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={product?.description ?? ""}
            className={inputClass}
          />
        </Field>

        {/* ---------- Precios ---------- */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Precios</legend>
          <p className="text-sm text-ink-soft">
            Dejá la etiqueta vacía si tiene un solo precio. Para tamaños o combos, una fila por cada uno
            (ej. &quot;Grande&quot;, &quot;+ 2 medialunas&quot;). Si no tiene precio, en la carta dice &quot;Consultar&quot;.
          </p>

          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={r.key} className="flex items-center gap-2">
                <input
                  name="price_label"
                  value={r.label}
                  onChange={(e) => update(r.key, { label: e.target.value })}
                  placeholder={rows.length === 1 ? "Precio único" : "Tamaño o combo"}
                  aria-label={`Etiqueta del precio ${i + 1}`}
                  className={`${inputClass} min-w-0 flex-[3]`}
                />
                <div className="relative min-w-0 flex-[2]">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft">$</span>
                  <input
                    name="price_value"
                    value={r.value}
                    onChange={(e) => update(r.key, { value: e.target.value })}
                    inputMode="decimal"
                    placeholder="0"
                    aria-label={`Precio ${i + 1}`}
                    className={`${inputClass} pl-7 tabular-nums`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRows((rs) => (rs.length === 1 ? [row()] : rs.filter((x) => x.key !== r.key)))}
                  className={iconButton}
                  aria-label={`Quitar precio ${i + 1}`}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRows((rs) => [...rs, row()])}
              className={`${buttonSecondary} px-3 py-1.5 text-sm`}
            >
              <Plus className="size-4" aria-hidden /> Agregar precio
            </button>
            {columnsMissing && (
              <button
                type="button"
                onClick={() =>
                  setRows((rs) => [
                    ...category!.price_columns
                      .filter((c) => !rs.some((r) => r.label === c))
                      .map((c) => row(c)),
                    ...rs.filter((r) => r.label || r.value),
                  ])
                }
                className={`${buttonSecondary} px-3 py-1.5 text-sm`}
              >
                <Columns3 className="size-4" aria-hidden /> Usar columnas de {category!.name}
              </button>
            )}
          </div>
        </fieldset>

        {/* ---------- Estado ---------- */}
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-lg border-2 border-line bg-card px-3 py-3">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={product?.is_available ?? true}
              className="mt-0.5 size-5 accent-[var(--ink)]"
            />
            <span>
              <span className="block font-semibold">Disponible</span>
              <span className="text-sm text-ink-soft">Si lo desmarcás aparece como &quot;Agotado&quot;.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border-2 border-line bg-card px-3 py-3">
            <input
              type="checkbox"
              name="needs_review"
              defaultChecked={product?.needs_review ?? false}
              className="mt-0.5 size-5 accent-[var(--ink)]"
            />
            <span>
              <span className="block font-semibold">Precio a revisar</span>
              <span className="text-sm text-ink-soft">Recordatorio interno, no se ve en la carta.</span>
            </span>
          </label>
        </div>
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
