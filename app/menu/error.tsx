"use client";

/** Si falla la carga de la carta (por ej. sin conexión a Supabase). */
export default function MenuError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-2xl font-bold">No pudimos cargar la carta.</p>
      <p className="text-ink-soft">Revisá tu conexión e intentá de nuevo.</p>
      <button
        onClick={reset}
        className="rounded-full bg-ink px-5 py-2 font-semibold text-paper"
      >
        Reintentar
      </button>
    </main>
  );
}
