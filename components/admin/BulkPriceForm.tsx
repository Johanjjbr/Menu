"use client";

import { useActionState } from "react";
import { TrendingUp } from "lucide-react";
import { increasePrices } from "@/app/admin/actions";
import { Field, FormError, inputClass, buttonPrimary } from "./ui";

/**
 * Aumento (o rebaja) masivo de precios por porcentaje, con redondeo.
 * Pide confirmación antes de aplicar porque cambia muchos precios juntos.
 */
export function BulkPriceForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(increasePrices, undefined);

  function confirmSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const percent = String(data.get("percent") ?? "").trim();
    const cat = categories.find((c) => c.id === data.get("category_id"))?.name ?? "toda la carta";
    const sign = percent.startsWith("-") ? "" : "+";
    if (!window.confirm(`¿Aplicar ${sign}${percent} % a ${cat}?`)) e.preventDefault();
  }

  return (
    <section className="mt-12 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <TrendingUp className="size-5 text-brand-ink" aria-hidden /> Actualizar precios por porcentaje
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Sube todos los precios de una categoría (o de toda la carta) y los redondea. Para bajar, usá
        un número negativo.
      </p>

      <form action={action} onSubmit={confirmSubmit} className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Categoría" htmlFor="bulk-category">
          <select id="bulk-category" name="category_id" className={inputClass} defaultValue="">
            <option value="">Toda la carta</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Porcentaje" htmlFor="bulk-percent">
          <div className="relative">
            <input
              id="bulk-percent"
              name="percent"
              inputMode="decimal"
              required
              placeholder="10"
              className={`${inputClass} pr-8`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-soft">
              %
            </span>
          </div>
        </Field>
        <Field label="Redondear a" htmlFor="bulk-round">
          <select id="bulk-round" name="round_to" className={inputClass} defaultValue="100">
            <option value="100">$ 100</option>
            <option value="500">$ 500</option>
            <option value="50">$ 50</option>
            <option value="10">$ 10</option>
            <option value="0">Sin redondeo</option>
          </select>
        </Field>

        <div className="space-y-3 sm:col-span-3">
          <FormError message={state?.error} />
          {state?.message && (
            <p role="status" className="rounded-lg bg-brand/15 px-3 py-2 text-sm font-medium">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending} className={buttonPrimary}>
            {pending ? "Actualizando…" : "Aplicar aumento"}
          </button>
        </div>
      </form>
    </section>
  );
}
