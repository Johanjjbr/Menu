"use client";

import { useEffect, useRef, useState } from "react";

type Props = { categories: { id: string; name: string }[] };

/**
 * Barra de categorías fija arriba (mobile-first).
 * - Tocar una categoría hace scroll a su sección.
 * - Al scrollear, la categoría visible se resalta sola (scrollspy) y la
 *   barra se desplaza para que el botón activo quede a la vista.
 */
export function CategoryNav({ categories }: Props) {
  const [active, setActive] = useState(categories[0]?.id);
  const barRef = useRef<HTMLDivElement>(null);

  // Detecta qué sección está en la parte superior de la pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("cat-", ""));
      },
      // la "zona activa" es una franja cerca del borde superior
      { rootMargin: "-80px 0px -65% 0px" },
    );

    categories.forEach(({ id }) => {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  // Mantiene el botón activo visible dentro de la barra horizontal
  useEffect(() => {
    const bar = barRef.current;
    const btn = bar?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (bar && btn) {
      bar.scrollTo({ left: btn.offsetLeft - 16, behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav
      aria-label="Categorías"
      className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur"
    >
      <div ref={barRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {categories.map(({ id, name }) => {
          const isActive = id === active;
          return (
            <a
              key={id}
              data-id={id}
              href={`#cat-${id}`}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink hover:border-ink"
              }`}
            >
              {name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
