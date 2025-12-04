// middleware.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function middleware(req: any) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();

  // Obtener la ruta actual
  const pathname = req.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/"];
  
  // Si está en la raíz o login y está autenticado, redirigir a dashboard
  if ((pathname === "/" || pathname === "/login") && data.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si NO está logueado y trata de acceder al dashboard, redirigir a login
  if (!data.user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};