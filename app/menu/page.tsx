import { Suspense } from "react";
import { connection } from "next/server";
import { PartyPopper, MessageCircle } from "lucide-react";
import { getMenu } from "@/lib/data/menu";
import { restaurant, whatsappLink } from "@/lib/config";
import { MenuBrowser } from "@/components/menu/MenuBrowser";

export const metadata = { title: "Menú" };

/**
 * Vista pública de la carta (/menu), la que abre el QR.
 *
 * Encabezado y pie son estáticos (se prerenderizan). La carta se
 * consulta en cada visita (await connection()) para que un precio o un
 * "Agotado" cambiado en el admin se vea al instante.
 */
export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1">
      <header className="px-4 pt-10 pb-5 sm:px-6">
        <h1 className="font-display text-[2.75rem] font-extrabold leading-none tracking-tight sm:text-6xl">
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="mt-3 text-lg font-medium text-ink-soft">
            <span className="brackets">{restaurant.tagline}</span>
          </p>
        )}
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>

      <EventsFooter />
    </main>
  );
}

async function MenuContent() {
  await connection(); // siempre datos frescos
  const menu = await getMenu();

  if (menu.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-ink-soft sm:px-6">
        La carta se está preparando. Volvé a mirar en un rato.
      </p>
    );
  }

  return <MenuBrowser categories={menu} />;
}

/** Pie con la invitación a eventos, como en la carta impresa. */
function EventsFooter() {
  const link = whatsappLink(`Hola ${restaurant.name}, quiero consultar por un evento.`);
  return (
    <footer className="mt-14 px-4 pb-12 sm:px-6">
      <div className="rounded-2xl bg-ink p-6 text-paper">
        <PartyPopper className="size-6 text-brand" aria-hidden />
        <h2 className="mt-3 font-display text-2xl font-bold">Festejá tus momentos especiales</h2>
        <p className="mt-1 leading-relaxed text-paper/80">
          Baby showers, bautismos, reuniones, cumpleaños y aniversarios. Organizamos tu evento en{" "}
          {restaurant.name}.
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 font-semibold text-[#1f2622]"
          >
            <MessageCircle className="size-4" aria-hidden /> Consultar por WhatsApp
          </a>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-ink-soft">Precios en pesos argentinos.</p>
    </footer>
  );
}

function MenuSkeleton() {
  return (
    <div className="animate-pulse px-4 sm:px-6" aria-label="Cargando la carta">
      <div className="h-11 rounded-full bg-line/60" />
      <div className="mt-4 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 flex-1 rounded bg-line/50" />
        ))}
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="mt-8 space-y-5">
          <div className="h-7 w-40 rounded bg-line/70" />
          {[0, 1, 2].map((r) => (
            <div key={r} className="space-y-2">
              <div className="h-5 w-full rounded bg-line/50" />
              <div className="h-4 w-2/3 rounded bg-line/40" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
