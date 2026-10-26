# Mapa de ruta — Menú digital La Carmela

Leyenda: ✅ hecho · 🔜 próximo · ⏳ depende de otra cosa · 💡 idea a futuro

---

## Fase 0 — Cuentas y acceso

| | Tarea | Quién |
|---|---|---|
| ✅ | Invitar a Johan a la organización de Supabase | Julieta |
| ⏳ | Reconectar el conector de Supabase en Claude incluyendo la organización de Julieta (o aplicar `setup-completo.sql` a mano) | Johan |
| ⏳ | Subir este repo a GitHub y agregar a ambos como colaboradores | Johan |
| ⏳ | Importar el repo en Vercel desde la cuenta de Julieta | Julieta |
| ⏳ | Si el repo es privado y estamos en Hobby: decidir entre repo público, que Julieta haga los merges a `main` o pasar a Pro | Ambos |

## Fase 1 — Proyecto y base de datos

- ✅ Next.js 16 (App Router, TypeScript, Tailwind v4, Cache Components)
- ✅ Esquema v2 pensado para la carta real:
  - categorías con **grupo** (Cafetería / Comidas / Bebidas), **formato** (lista, menú del día, promos), **columnas de precio** y foto
  - productos con **varios precios** (tamaños y combos), aclaración corta y marca "a revisar"
  - función `increase_prices` para **aumentos masivos** por porcentaje
  - RLS: lectura pública, escritura solo autenticados · bucket `product-images`
- ✅ **Carta de La Carmela transcripta** de las fotos: 15 categorías, 95 productos (`supabase/seed.sql`)
- ✅ `supabase/setup-completo.sql`: todo en un archivo, probado en Postgres
- ⏳ **Ejecutar el setup en Supabase**
- ⏳ **Desactivar el registro público** (*Authentication → Sign In / Providers → Allow new users to sign up: OFF*)
- ⏳ **Crear el usuario admin** (*Authentication → Users → Add user*, con *Auto Confirm*)

## Fase 2 — Vista pública `/menu` (rediseño sobrio)

- ✅ Encabezado "La Carmela" con los corchetes del logo en verde lima
- ✅ Pestañas fijas Cafetería / Comidas / Bebidas + chips de categorías con scrollspy
- ✅ Buscador en toda la carta (sin importar tildes)
- ✅ Tablas de tamaños (pizzas, empanadas, gaseosas, cervezas)
- ✅ Tarjeta destacada "Menú del día" y tarjetas de Promos
- ✅ Precios por tamaño o combo, "Consultar" si no hay precio, "Agotado" tachado
- ✅ Pie "Festejá tus momentos especiales" con botón de WhatsApp (configurable)
- ✅ Modo oscuro automático

## Fase 3 — Autenticación y panel `/admin`

- ✅ `proxy.ts` protege `/admin/*` y refresca la sesión
- ✅ Productos agrupados por grupo y categoría, con filtro "Ver solo los que hay que revisar"
- ✅ Formulario con editor de precios (filas por tamaño, autocompleta con las columnas de la categoría)
- ✅ Categorías por grupo: crear, ordenar dentro del grupo, editar formato/columnas/nota/foto, borrar
- ✅ Aumento masivo de precios con redondeo ($ 10 / 50 / 100 / 500)
- ✅ Página `/admin/qr`

## Fase 4 — Imágenes y disponibilidad

- ✅ Fotos de producto y de sección (circular) a Supabase Storage, comprimidas en el navegador
- ✅ Toggle Disponible / Agotado con actualización optimista

## Fase 5 — Puesta en producción

- 🔜 **Revisar los 31 precios marcados** en /admin (ilegibles o dudosos en las fotos)
- 🔜 Probar de punta a punta con el Supabase real (login, alta, edición, fotos, aumento)
- 🔜 Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_RESTAURANT_NAME`, `NEXT_PUBLIC_RESTAURANT_TAGLINE`, `NEXT_PUBLIC_WHATSAPP`
- 🔜 Primer deploy y prueba desde un celular real
- 🔜 Generar el QR desde el dominio definitivo e imprimirlo para las mesas
- 🔜 (Opcional) dominio propio

## Ideas a futuro

- 💡 Reordenar productos arrastrando dentro de una categoría
- 💡 Etiquetas: vegetariano, sin TACC, picante
- 💡 Actualización en vivo con Supabase Realtime
- 💡 Horarios: mostrar "Cocina cerrada" fuera de horario
- 💡 Historial de precios (quién cambió qué y cuándo)
