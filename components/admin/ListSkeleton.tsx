/** Placeholder mientras cargan los listados del admin. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3" aria-label="Cargando">
      <div className="h-6 w-40 rounded bg-line/70" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded-xl bg-line/40" />
      ))}
    </div>
  );
}
