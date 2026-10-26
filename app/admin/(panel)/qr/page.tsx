import { Suspense } from "react";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { restaurant } from "@/lib/config";
import { PageTitle, buttonPrimary } from "@/components/admin/ui";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = { title: "Código QR" };

/**
 * /admin/qr — genera el código QR que apunta a /menu en el dominio
 * actual (localhost en desarrollo, el dominio de Vercel en producción).
 */
export default function QrPage() {
  return (
    <>
      <PageTitle>Código QR de la carta</PageTitle>
      <Suspense fallback={<div className="aspect-square w-72 animate-pulse rounded-xl bg-line/40" />}>
        <QrCard />
      </Suspense>
    </>
  );
}

async function QrCard() {
  await requireUser();

  // Armamos la URL pública a partir del host del request
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const menuUrl = `${protocol}://${host}/menu`;

  const svg = await QRCode.toString(menuUrl, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#173b2f", light: "#ffffff" },
  });
  const downloadHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Tarjeta lista para imprimir y poner en las mesas */}
      <div
        id="qr-card"
        className="w-72 rounded-2xl border-2 border-ink bg-white p-6 text-center text-[#173b2f]"
      >
        <p className="font-display text-2xl font-extrabold">{restaurant.name}</p>
        <div className="mx-auto my-3 w-56" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="font-semibold">Escaneá para ver la carta</p>
      </div>

      <div className="space-y-3">
        <p className="text-ink-soft">
          Apunta a <span className="font-semibold text-ink break-all">{menuUrl}</span>
        </p>
        <p className="max-w-sm text-sm text-ink-soft">
          Generalo desde el dominio definitivo (el de Vercel o el propio) para que el QR impreso
          no cambie nunca. La carta se actualiza sola: no hace falta reimprimirlo al cambiar precios.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={downloadHref} download="qr-menu.svg" className={buttonPrimary}>
            <Download className="size-4" aria-hidden /> Descargar SVG
          </a>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
