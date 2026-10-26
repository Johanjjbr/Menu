import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * Lógica del proxy (antes "middleware") para las rutas /admin:
 *
 * 1. Refresca el token de sesión de Supabase si venció y lo reescribe en
 *    las cookies. Sin esto los usuarios se "desloguean" solos.
 * 2. Redirige a /admin/login si no hay sesión.
 * 3. Redirige a /admin si ya hay sesión y se entra al login.
 *
 * Es solo un chequeo rápido: cada Server Action vuelve a verificar el
 * usuario, y las políticas RLS protegen los datos en la base.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims() valida el JWT (y lo refresca si hace falta).
  // No meter código entre createServerClient y esta llamada.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!isLoggedIn && !isLoginPage) {
    return redirectKeepingCookies(request, response, "/admin/login");
  }
  if (isLoggedIn && isLoginPage) {
    return redirectKeepingCookies(request, response, "/admin");
  }

  return response;
}

/** Redirige sin perder las cookies de sesión recién refrescadas. */
function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  path: string,
) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
