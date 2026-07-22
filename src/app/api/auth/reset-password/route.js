// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/reset-password
 *
 * Envía un correo con instrucciones de recuperación.
 * Usa el cliente admin (service_role) para llamar a generateLink
 * y luego devolver el link al cliente si lo necesita.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Correo inválido.' },
        { status: 400 },
      );
    }

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/login?reset=1`,
    });

    if (error) {
      console.error('[api/auth/reset-password] error:', error);
    }

    // Por seguridad, siempre retornamos ok (no revelar si el correo existe).
    return NextResponse.json({
      ok: true,
      message:
        'Si el correo existe en nuestra base, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (err) {
    console.error('[api/auth/reset-password] unexpected:', err);
    return NextResponse.json({ ok: true }); // nunca exponer errores
  }
}