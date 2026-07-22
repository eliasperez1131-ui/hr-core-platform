// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * POST /api/auth/logout
 *
 * Cierra la sesión actual del usuario y limpia las cookies.
 */
export async function POST() {
  try {
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
            try { cookieStore.set({ name, value, ...options }); } catch { /* noop */ }
          },
          remove(name, options) {
            try { cookieStore.set({ name, value: '', ...options }); } catch { /* noop */ }
          },
        },
      },
    );

    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/auth/logout] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error al cerrar sesión.' },
      { status: 500 },
    );
  }
}