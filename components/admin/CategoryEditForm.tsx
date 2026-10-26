"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { updateCategory } from "@/app/admin/actions";
import { CATEGORY_KINDS, MENU_GROUPS, type Category } from "@/lib/types";
import { ImageUpload } from "./ImageUpload";
import { Field, FormError, inputClass, buttonPrimary, buttonSecondary } from "./ui";

/** Formulario completo de una categoría. */
export function CategoryEditForm({ category }: { category: Category }) {
  const [state, action, pending] = useActionState(updateCategory, undefined);
  const [uploading, setUploading] = useState(false);

  return (
    <form action={action} className="grid gap-6 md:grid-cols-[1fr_200px]">
      <input type="hidden" name="id" value={category.id} />

      <div className="space-y-4">
        <Field label="Nombre" htmlFor="name">
          <input id="name" name="name" required maxLength={80} defaultValue={category.name} className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Grupo" htmlFor="menu_group" hint="La pestaña de la carta donde aparece.">
            <select id="menu_group" name="menu_group" defaultValue={category.menu_group} className={inputClass}>
              {MENU_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Formato"
            htmlFor="kind"
            hint={CATEGORY_KINDS.map((k) => `${k.label}: ${k.hint.toLowerCase()}`).join(". ") + "."}
          >
            <select id="kind" name="kind" defaultValue={category.kind} className={inputClass}>
              {CATEGORY_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Columnas de precio"
          htmlFor="price_columns"
          hint="Opcional. Separadas por coma, por ejemplo: Entera, Media. Si las completás, la categoría se muestra como tabla con una columna por tamaño."
        >
          <input
            id="price_columns"
            name="price_columns"
            defaultValue={category.price_columns.join(", ")}
            placeholder="Lata, 500 ml, 1½ L"
            className={inputClass}
          />
        </Field>

        <Field label="Nota" htmlFor="note" hint="Opcional. Aparece debajo del título, por ejemplo: Consultá la opción de hoy.">
          <input id="note" name="note" maxLength={140} defaultValue={category.note ?? ""} className={inputClass} />
        </Field>
      </div>

      <ImageUpload
        initialUrl={category.image_url}
        onUploadingChange={setUploading}
        label="Foto de la sección"
        folder="categories"
        round
      />

      <div className="space-y-3 md:col-span-2">
        <FormError message={state?.error} />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending || uploading} className={buttonPrimary}>
            <Save className="size-4" aria-hidden />
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <Link href="/admin/categories" className={buttonSecondary}>
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
