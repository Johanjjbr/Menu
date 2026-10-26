"use client";

/** Error dentro del panel (por ej. falló una consulta a Supabase). */
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border-2 border-vermouth/40 bg-vermouth/5 p-6">
      <p className="font-display text-xl font-bold">Algo salió mal al cargar esta sección.</p>
      <p className="mt-1 text-sm text-ink-soft">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-ink px-4 py-2 font-semibold text-paper"
      >
        Reintentar
      </button>
    </div>
  );
}
