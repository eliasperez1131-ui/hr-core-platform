// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { HOME_POR_ROL } from '@/lib/routes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HR CORE — Alias de Super Admin.
 * Si el frontend envía exactamente "ADMIN", el backend lo transforma
 * automáticamente a "admin@hrcore.com" para hacer match con Supabase.
 * Es una capa de defensa adicional (el frontend ya lo hace).
 */
const ADMIN_ALIAS = 'ADMIN';
const ADMIN_EMAIL_BACKEND = 'admin@hrcore.com';

function resolverEmail(usuario) {
  if (!usuario) return '';
  const trimmed = String(usuario).trim();
  if (trimmed.toUpperCase() === ADMIN_ALIAS) return ADMIN_EMAIL_BACKEND;
  return trimmed;
}

/**
 * POST /api/auth/login
 *
 * Body: { email | usuario, password }
 *
 * Acepta tanto un correo completo como el alias "ADMIN".
 *
 * Flujo:
 *   1. Resuelve el alias (ADMIN → admin@hrcore.com).
 *   2. Valida formato de correo.
 *   3. signInWithPassword (Supabase Auth).
 *   4. Lee el rol del usuario en user_profiles.
 *   5. Determina la ruta de redirección según rol.
 *   6. Setea cookies de sesión.
 *   7. Retorna { ok, redirect }.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const emailRaw = String(body.email ?? body.usuario ?? '').trim();
    const email    = resolverEmail(emailRaw).toLowerCase();
    const password = String(body.password ?? '');
    const next     = typeof body.next === 'string' && body.next.startsWith('/') ? body.next : null;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Usuario o contraseña incorrectos.' },
        { status: 400 },
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña es obligatoria.' },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch { /* read-only context */ }
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch { /* read-only context */ }
          },
        },
      },
    );

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      const msg =
        authError?.message?.toLowerCase().includes('invalid login')
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : authError?.message || 'No se pudo iniciar sesión.';
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }

    // Leer rol del usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('rol, activo, nombre_completo')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { ok: false, error: 'Tu perfil no está configurado. Contacta al administrador.' },
        { status: 403 },
      );
    }

    if (profile.activo === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { ok: false, error: 'Tu cuenta está deshabilitada. Contacta al administrador.' },
        { status: 403 },
      );
    }

    const rol = profile.rol || 'Cliente_Invitado';
    const home = HOME_POR_ROL[rol] || '/dashboard-saas';
    const redirect = next && next !== '/login' && next !== '/registro' ? next : home;

    return NextResponse.json({
      ok: true,
      redirect,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        rol,
        nombre_completo: profile.nombre_completo,
      },
    });
  } catch (err) {
    console.error('[api/auth/login] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado al iniciar sesión.' },
      { status: 500 },
    );
  }
}