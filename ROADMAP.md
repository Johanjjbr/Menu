# Mapa de ruta — Menú digital

Leyenda: ✅ hecho · 🔜 próximo · ⏳ depende de otra cosa · 💡 idea a futuro

---

## Fase 0 — Cuentas y acceso

| | Tarea | Quién |
|---|---|---|
| ⏳ | Invitar a Johan a la organización de Supabase (*Settings → Team → Invite*, rol Developer u Owner) | Julieta |
| ⏳ | Subir este repo a GitHub y agregar a ambos como colaboradores | Johan |
| ⏳ | Importar el repo en Vercel desde la cuenta de Julieta | Julieta |
| ⏳ | Si el repo es privado y estamos en Hobby: decidir entre repo público, que Julieta haga los merges a `main` o pasar a Pro | Ambos |

## Fase 1 — Proyecto y base de datos

- ✅ Proyecto Next.js 16 (App Router, TypeScript, Tailwind v4, Cache Components)
- ✅ Dependencias: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `qrcode`
- ✅ Migración SQL: `supabase/migrations/20261026000000_init.sql`
  - tablas `categories` y `products`
  - RLS: lectura pública, escritura solo para usuarios autenticados
  - bucket de Storage `product-images` con sus políticas
- ✅ Datos de ejemplo: `supabase/seed.sql`
- ⏳ **Ejecutar la migración en Supabase** (cuando tengamos acceso)
- ⏳ **Desactivar el registro público** (*Authentication → Sign In / Providers → Allow new users to sign up: OFF*)
- ⏳ **Crear el usuario admin** (*Authentication → Users → Add user*)

## Fase 2 — Vista pública `/menu`

- ✅ Clientes de Supabase: `lib/supabase/{server,client,public,proxy}.ts`
- ✅ Carta mobile-first con barra de categorías fija y scrollspy
- ✅ Precio con línea de puntos, foto opcional, "Agotado" tachado
- ✅ Datos siempre frescos (sin cache): un cambio en el admin se ve al recargar
- ✅ Modo oscuro automático, skeleton de carga, pantalla de error
- ✅ `/` redirige a `/menu`

## Fase 3 — Autenticación y panel `/admin`

- ✅ `proxy.ts`: refresca la sesión y protege todo `/admin/*`
- ✅ Login con email y contraseña (`/admin/login`)
- ✅ Productos: listado por categoría, crear, editar, borrar
- ✅ Categorías: crear, renombrar, subir/bajar el orden, borrar (si no tiene productos)
- ✅ Cada Server Action re-verifica al usuario (`requireUser`) además de RLS
- ✅ Página `/admin/qr`: genera, descarga e imprime el QR de la carta

## Fase 4 — Imágenes y disponibilidad

- ✅ Subida de fotos directo a Supabase Storage desde el navegador
- ✅ Compresión en el navegador (máx. 1200 px, WebP) antes de subir
- ✅ Al reemplazar o borrar un producto se borra su foto vieja
- ✅ Toggle Disponible / Agotado con actualización optimista

## Fase 5 — Puesta en producción

- 🔜 Probar todo de punta a punta con el Supabase real
- 🔜 Cargar variables de entorno en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_RESTAURANT_NAME`, `NEXT_PUBLIC_RESTAURANT_TAGLINE`)
- 🔜 Primer deploy y prueba desde un celular real
- 🔜 Generar el QR desde el dominio definitivo e imprimirlo
- 🔜 (Opcional) dominio propio en Vercel

## Ideas a futuro

- 💡 Reordenar productos dentro de una categoría (columna `sort_order` en `products`)
- 💡 Etiquetas: vegetariano, sin TACC, picante
- 💡 Actualización en vivo con Supabase Realtime (la carta se refresca sola sin recargar)
- 💡 Varios idiomas (ES / EN) para turistas
- 💡 Horarios: mostrar "Cocina cerrada" fuera de horario
- 💡 Analytics de Vercel para ver cuánta gente escanea el QR
