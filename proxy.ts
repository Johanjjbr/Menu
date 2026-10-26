import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy de Next.js 16 (lo que antes se llamaba middleware.ts).
 * Corre antes de cada request que coincida con el matcher.
 * Solo lo necesitamos en /admin; /menu es público y no usa sesión.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
