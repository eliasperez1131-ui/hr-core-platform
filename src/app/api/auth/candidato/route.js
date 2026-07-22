// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { normalizePhone, normalizeToken, isValidTokenFormat } from '@/lib/seguro';

const PHONE_RE = /^[\d\s+\-()]{8,25}$/;

/**
 * POST /api/auth/candidato
 *
 * Login del candidato para acceder a su evaluación.
 *
 * Body: { telefono: string, token_acceso: string }
 *
 * Flujo:
 *  1. Valida formato.
 *  2. Normaliza (solo dígitos en teléfono, uppercase en token).
 *  3. Busca en `candidatos` por token_acceso (índice único).
 *  4. Compara telefono normalizado con el de la BD.
 *  5. Si coincide → devuelve candidato + estatus.
 *  6. Si no → 401 con mensaje genérico.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const telefonoRaw = String(body.telefono ?? '');
    const tokenRaw    = String(body.token_acceso ?? '');

    if (!PHONE_RE.test(telefonoRaw)) {
      return NextResponse.json(
        { ok: false, error: 'El teléfono debe tener entre 8 y 25 caracteres numéricos.' },
        { status: 400 },
      );
    }
    if (!isValidTokenFormat(normalizeToken(tokenRaw))) {
      return NextResponse.json(
        { ok: false, error: 'El token debe tener entre 6 y 8 caracteres (mayúsculas y números).' },
        { status: 400 },
      );
    }

    const token       = normalizeToken(tokenRaw);
    const telefonoNorm = normalizePhone(telefonoRaw);

    const supabase = createAdminClient();

    // 1) Buscar por token (índice único)
    const { data: candidatos, error } = await supabase
      .from('candidatos')
      .select('id, nombre_completo, correo, telefono, token_acceso, estatus_reclutamiento, vacantes_participadas, inasistencias, abandonos')
      .eq('token_acceso', token)
      .limit(5);

    if (error) {
      console.error('[api/auth/candidato] supabase error:', error);
      return NextResponse.json(
        { ok: false, error: 'Error en la búsqueda. Intenta de nuevo.' },
        { status: 500 },
      );
    }

    // 2) Buscar match por teléfono normalizado
    const candidato = (candidatos || []).find(
      (c) => normalizePhone(c.telefono) === telefonoNorm,
    );

    if (!candidato) {
      return NextResponse.json(
        { ok: false, error: 'Teléfono o Token incorrectos. Verifica tu información.' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      candidato: {
        id:                  candidato.id,
        nombre_completo:     candidato.nombre_completo,
        correo:              candidato.correo,
        estatus_reclutamiento: candidato.estatus_reclutamiento || 'Pendiente',
        vacantes_participadas: candidato.vacantes_participadas || 0,
        inasistencias:        candidato.inasistencias || 0,
        abandonos:           candidato.abandonos || 0,
      },
    });
  } catch (err) {
    console.error('[api/auth/candidato] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado.' },
      { status: 500 },
    );
  }
}