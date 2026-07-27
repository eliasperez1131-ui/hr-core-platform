import { NextResponse } from 'next/server';
import { refreshSession, buildResponse } from '@/lib/supabase-middleware';
import { rolesPermitidosPara } from '@/lib/routes';

/**
 * Next.js Middleware — protege rutas privadas usando sesion JWT propia.
 *
 * DISEÑO RESILIENTE:
 *  - Si la BD no responde, NO se cae el sitio (modo degradado).
 *  - Si la sesion es invalida, redirige a /login.
 *  - Si el rol no califica, redirige al home del rol.
 *
 * Reglas:
 *  1. Ruta protegida + sin sesion  -> /login?next=<ruta>
 *  2. Ruta protegida + sesion pero rol no califica -> home del rol
 *  3. Si ya hay sesion y entra a /login o /register -> redirige al home
 *  4. Cualquier error de BD -> permite paso (warning en consola)
 */
export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const response = buildResponse(request);

  // Refrescar/verificar sesion (de forma resiliente)
  let user = null;
  try {
    const session = await refreshSession(request, response);
    user = session.user;
  } catch (err) {
    console.warn('[middleware] Error verificando sesion (BD no disponible?):', err?.message);
    // Continuar sin usuario (modo degradado)
  }

  const permitidos    = rolesPermitidosPara(pathname);
  const rutaProtegida = permitidos !== null;

  // ─────────────────────────────────────────────────────────────
  //  Rutas protegidas
  // ─────────────────────────────────────────────────────────────
  if (rutaProtegida) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname + (request.nextUrl.search || ''));
      return NextResponse.redirect(url);
    }

    const rol = user.rol || 'Cliente_Invitado';

    if (rol === 'Cliente_Invitado' && !user.activo) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'Tu cuenta está deshabilitada. Contacta al administrador.');
      return NextResponse.redirect(url);
    }

    if (!permitidos.includes(rol)) {
      const home = '/dashboard-saas';
      const url = request.nextUrl.clone();
      url.pathname = home;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Si ya está autenticado y entra a /login o /register
  // ─────────────────────────────────────────────────────────────
  if (user && (pathname === '/login' || pathname === '/registro')) {
    const home = '/dashboard-saas';
    const next = searchParams.get('next');
    if (next && next.startsWith('/')) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(new URL(home, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
