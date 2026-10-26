"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { buttonSecondary, buttonDanger } from "./ui";

const MAX_SIDE = 1200; // px — más que suficiente para un celular
const QUALITY = 0.82;

/**
 * Selector de foto del producto.
 *
 * 1. El usuario elige una imagen (o saca una foto con el celular).
 * 2. La achicamos en el navegador a 1200 px y la pasamos a WebP, así una
 *    foto de 5 MB del celular queda en ~150 KB y la carta carga rápido.
 * 3. La subimos directo a Supabase Storage (bucket product-images).
 *    Las políticas solo dejan subir a usuarios logueados.
 * 4. Guardamos la URL pública en un <input hidden name="image_url"> que
 *    viaja con el resto del formulario.
 */
export function ImageUpload({
  initialUrl,
  onUploadingChange,
}: {
  initialUrl: string | null;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  function setBusy(value: boolean) {
    setUploading(value);
    onUploadingChange?.(value);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo tiene que ser una imagen.");
      return;
    }

    setError(undefined);
    setBusy(true);
    try {
      const blob = await resizeToWebp(file);
      const path = `products/${crypto.randomUUID()}.webp`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err) {
      setError(
        `No se pudo subir la foto. ${err instanceof Error ? err.message : ""}`.trim(),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold">Foto</span>
      <input type="hidden" name="image_url" value={url ?? ""} />

      <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-line bg-card">
        {url ? (
          <Image src={url} alt="Foto del producto" fill sizes="220px" className="object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-ink-soft hover:text-ink"
          >
            <ImagePlus className="size-8" aria-hidden />
            <span className="text-sm font-semibold">Agregar foto</span>
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80">
            <Loader2 className="size-6 animate-spin" aria-label="Subiendo foto" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      {url && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`${buttonSecondary} flex-1 px-2 py-2 text-sm`}
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={() => setUrl(null)}
            disabled={uploading}
            className={`${buttonDanger} px-2 py-2 text-sm`}
            aria-label="Quitar foto"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-vermouth">
          {error}
        </p>
      )}
      <p className="text-xs text-ink-soft">Se guarda al tocar el botón de guardar.</p>
    </div>
  );
}

/** Achica la imagen (lado mayor ≤ MAX_SIDE) y la convierte a WebP. */
async function resizeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no permite procesar imágenes.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo convertir la imagen."))),
      "image/webp",
      QUALITY,
    ),
  );
}
