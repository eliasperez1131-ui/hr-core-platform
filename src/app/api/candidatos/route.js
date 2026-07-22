// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { generateTokenAcceso } from '@/lib/seguro';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+\-()]{10,20}$/;

/**
 * POST /api/candidatos
 *
 * Crea un nuevo candidato en la tabla `candidatos`.
 *
 * Body:
 *   {
 *     nombre_completo: string,
 *     correo:          string,
 *     telefono:        string,
 *     edad?:           number,
 *     escolaridad?:    string,
 *     estado?:         string,
 *     municipio?:      string,
 *     url_cv_pdf?:     string,
 *     consentimiento_red?: boolean,
 *     workspace_id?:   UUID   // se setea desde el contexto (Admin/Coord)
 *   }
 *
 * Antes de insertar, verifica que el correo o teléfono NO existan
 * ya en la tabla. Si existen → 409 Conflict con data del candidato
 * existente para que el frontend abra el modal de deduplicación.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const nombre_completo = String(body.nombre_completo ?? '').trim();
    const correo          = String(body.correo          ?? '').trim().toLowerCase();
    const telefono        = String(body.telefono        ?? '').trim();

    if (nombre_completo.length < 3) {
      return NextResponse.json({ ok: false, error: 'El nombre es obligatorio.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(correo)) {
      return NextResponse.json({ ok: false, error: 'Correo inválido.' }, { status: 400 });
    }
    if (!PHONE_RE.test(telefono)) {
      return NextResponse.json({ ok: false, error: 'Teléfono inválido.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verificar duplicados (correo O teléfono)
    const { data: existente } = await supabase
      .from('candidatos')
      .select('id, nombre_completo, correo, telefono')
      .or(`correo.eq.${correo},telefono.eq.${telefono}`)
      .maybeSingle();

    if (existente) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          candidato_existente: existente,
          error: 'Ya existe un candidato con este correo o teléfono.',
        },
        { status: 409 },
      );
    }

    const payload = {
      nombre_completo,
      correo,
      telefono,
      edad:               body.edad ? parseInt(body.edad, 10) : null,
      escolaridad:        body.escolaridad?.slice(0, 100) || null,
      estado:             body.estado?.slice(0, 50) || null,
      municipio:          body.municipio?.slice(0, 100) || null,
      url_cv_pdf:         body.url_cv_pdf || null,
      consentimiento_red: Boolean(body.consentimiento_red),
      workspace_id:       body.workspace_id || null,
      // Generamos token_acceso automáticamente.
      // El ALFABETO_SEGURO excluye O/0/I/L/1 (caracteres ambiguos).
      token_acceso:        generateTokenAcceso(7),
      estatus_reclutamiento: 'Pendiente',
    };

    const { data, error } = await supabase
      .from('candidatos')
      .insert(payload)
      .select('id, nombre_completo, correo, telefono, token_acceso')
      .single();

    if (error || !data) {
      // Si el INSERT falla por UNIQUE constraint (race condition), tratar como duplicado.
      if (error?.code === '23505') {
        return NextResponse.json(
          { ok: false, duplicate: true, error: 'Candidato duplicado (carrera detectada).' },
          { status: 409 },
        );
      }
      console.error('[api/candidatos] insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'No se pudo crear el candidato.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, candidato: data }, { status: 201 });
  } catch (err) {
    console.error('[api/candidatos] unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}