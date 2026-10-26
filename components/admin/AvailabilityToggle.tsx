"use client";

import { useOptimistic, useTransition, useState } from "react";
import { setAvailability } from "@/app/admin/actions";

/**
 * Interruptor Disponible / Agotado.
 *
 * Usa useOptimistic: el switch cambia al instante al tocarlo, y si la
 * Server Action falla vuelve solo al estado real y muestra el error.
 */
export function AvailabilityToggle({
  id,
  title,
  available,
}: {
  id: string;
  title: string;
  available: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(available);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function toggle() {
    const next = !optimistic;
    setError(undefined);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setAvailability(id, next);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-label={`${title}: ${optimistic ? "disponible" : "agotado"}`}
        onClick={toggle}
        disabled={pending}
        className="group flex items-center gap-2 rounded-full py-1 pr-1 pl-2 text-xs font-semibold"
      >
        <span className={`hidden w-16 text-right sm:inline ${optimistic ? "text-ink" : "text-vermouth"}`}>
          {optimistic ? "Disponible" : "Agotado"}
        </span>
        <span
          className={`relative h-6 w-11 rounded-full transition-colors ${
            optimistic ? "bg-ink" : "bg-vermouth/70"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
              optimistic ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>
      {error && (
        <span role="alert" className="mt-1 text-xs text-vermouth">
          {error}
        </span>
      )}
    </div>
  );
}
