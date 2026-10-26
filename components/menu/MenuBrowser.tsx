"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { MENU_GROUPS, type CategoryWithProducts, type MenuGroup } from "@/lib/types";
import { CategorySection } from "./CategorySection";

/** Quita tildes y pasa a minúsculas para buscar "cafe" y encontrar "Café". */
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Navegación de la carta (cliente):
 *  - 3 pestañas fijas: Cafetería / Comidas / Bebidas
 *  - debajo, chips con las categorías del grupo (resaltan al scrollear)
 *  - buscador que filtra en toda la carta
 */
export function MenuBrowser({ categories }: { categories: CategoryWithProducts[] }) {
  // Solo los grupos que tienen algo cargado
  const groups = useMemo(
    () => MENU_GROUPS.filter((g) => categories.some((c) => c.menu_group === g.id)),
    [categories],
  );
  const [group, setGroup] = useState<MenuGroup>(groups[0]?.id ?? "cafeteria");
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;

  // Categorías a mostrar: las del grupo activo, o los resultados de la búsqueda
  const visible = useMemo(() => {
    if (!searching) return categories.filter((c) => c.menu_group === group);
    const q = normalize(query.trim());
    return categories
      .map((c) => ({
        ...c,
        products: normalize(c.name).includes(q)
          ? c.products
          : c.products.filter((p) =>
              normalize(`${p.title} ${p.description ?? ""} ${p.note ?? ""}`).includes(q),
            ),
      }))
      .filter((c) => c.products.length > 0);
  }, [categories, group, query, searching]);

  const resultCount = visible.reduce((n, c) => n + c.products.length, 0);

  function selectGroup(id: MenuGroup) {
    setGroup(id);
    setQuery("");
    // Vuelve al comienzo de la carta sin saltar por encima del buscador
    document.getElementById("carta")?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <div className="px-4 pb-4 sm:px-6">
        <label className="relative block">
          <span className="sr-only">Buscar en la carta</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: milanesa, fernet, café…"
            className="w-full rounded-full border border-line bg-card py-2.5 pr-10 pl-9 text-base placeholder:text-ink-soft/80 focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Borrar búsqueda"
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:bg-line/60"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </div>

      <div id="carta" className="scroll-mt-0" />

      {!searching && (
        <nav aria-label="Secciones de la carta" className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
          <div role="tablist" className="flex px-2 sm:px-4">
            {groups.map((g) => {
              const active = g.id === group;
              return (
                <button
                  key={g.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => selectGroup(g.id)}
                  className={`flex-1 border-b-[3px] px-2 pt-3 pb-2 text-[0.95rem] font-semibold transition-colors ${
                    active ? "border-brand text-ink" : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          <CategoryChips key={group} categories={visible} />
        </nav>
      )}

      {searching && (
        <p className="px-4 pb-2 text-sm text-ink-soft sm:px-6" aria-live="polite">
          {resultCount === 0
            ? `No encontramos "${query.trim()}". Probá con otra palabra.`
            : resultCount === 1
              ? "1 resultado"
              : `${resultCount} resultados`}
        </p>
      )}

      <div className="mt-5 space-y-10 px-4 sm:px-6">
        {visible.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}

/** Chips de categorías del grupo, con scrollspy. */
function CategoryChips({ categories }: { categories: { id: string; name: string }[] }) {
  const [active, setActive] = useState(categories[0]?.id);
  const barRef = useRef<HTMLDivElement>(null);

  // Detecta qué sección está debajo de la barra fija
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    categories.forEach(({ id }) => {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  // Mantiene visible el chip activo dentro de la barra horizontal
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  if (categories.length < 2) return null;

  return (
    <div ref={barRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
      {categories.map(({ id, name }) => {
        const isActive = id === active;
        return (
          <a
            key={id}
            data-id={id}
            href={`#cat-${id}`}
            aria-current={isActive ? "true" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive ? "bg-ink text-paper" : "bg-line/50 text-ink hover:bg-line"
            }`}
          >
            {name}
          </a>
        );
      })}
    </div>
  );
}
