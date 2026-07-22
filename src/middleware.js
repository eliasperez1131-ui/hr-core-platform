import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase-middleware';
import { HOME_POR_ROL, rolesPermitidosPara } from '@/lib/routes';

/**
 * Next.js Middleware — protege rutas privadas y refresca la sesión.
 *
 * Reglas:
 *   1. Si la ruta es protegida y NO hay sesión → /login?next=<ruta>
 *   2. Si la ruta es protegida y hay sesión pero el rol no califica
 *      → redirige al dashboard correspondiente al rol del usuario.
 *   3. Si ya hay sesión y entra a /login o /registro → redirige al home.
 *
 * Adicionalmente refresca los tokens de Supabase Auth automáticamente
 * (set/remove de cookies en la respuesta).
 */
export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Construimos una respuesta mutable para que el cliente de Supabase
  // pueda escribir cookies de sesión sobre ella.
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createMiddlewareClient(request, response);

  // Refresca la sesión si está por expirar. Importante: NO remover.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  // Roles permitidos para la ruta actual (null = ruta pública).
  const permitidos = rolesPermitidosPara(pathname);
  const rutaProtegida = permitidos !== null;

  // ─────────────────────────────────────────────────────────────
  //  Rutas protegidas
  // ─────────────────────────────────────────────────────────────
  if (rutaProtegida) {
    if (!user) {
      // No autenticado → redirige a /login conservando el destino.
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname + (request.nextUrl.search || ''));
      return NextResponse.redirect(url);
    }

    // Autenticado: leer su rol desde user_profiles.
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('rol, activo')
      .eq('id', user.id)
      .single();

    const rol = profile?.rol ?? 'Cliente_Invitado';

    if (profile && profile.activo === false) {
      // Cuenta deshabilitada por un admin.
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'Tu cuenta está deshabilitada. Contacta al administrador.');
      return NextResponse.redirect(url);
    }

    if (!permitidos.includes(rol)) {
      // El rol no califica para esta ruta → redirige a su home.
      const home = HOME_POR_ROL[rol] || '/dashboard-saas';
      const url = request.nextUrl.clone();
      url.pathname = home;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Si ya está autenticado y entra a /login o /registro
  // ─────────────────────────────────────────────────────────────
  if (user && (pathname === '/login' || pathname === '/registro')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    const rol = profile?.rol ?? 'Cliente_Invitado';
    const home = HOME_POR_ROL[rol] || '/dashboard-saas';

    // Si viene con ?next= respeta esa ruta (si es válida).
    const next = searchParams.get('next');
    if (next && next.startsWith('/')) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(new URL(home, request.url));
  }

  return response;
}

/**
 * Aplicar el middleware a todas las rutas excepto:
 *   - Archivos estáticos (_next/static, _next/image, favicon, images)
 *   - API routes (cada route.js maneja su propia autorización)
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};