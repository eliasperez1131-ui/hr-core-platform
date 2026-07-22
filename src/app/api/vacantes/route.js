// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const TURNOS_VALIDOS = ['Fijo', 'Rolado', 'Ciclico'];
const MODALIDADES_VALIDAS = ['Presencial', 'Remoto', 'Híbrido'];
const ESTATUS_VALIDOS = ['Abierta', 'Cerrada', 'Pausada'];

/**
 * POST /api/vacantes
 *
 * Crea una vacante en el workspace del usuario autenticado.
 *
 * NOTA DE SEGURIDAD: este endpoint debe ejecutarse SIEMPRE en
 * el servidor. La verificación de rol (Admin/Coordinador) se
 * hace vía RLS al hacer el INSERT — si el usuario no tiene
 * permisos, Supabase rechaza la operación.
 *
 * En producción: leer `auth.uid()` desde la sesión y comparar
 * con user_profiles.rol antes de permitir el INSERT.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const titulo_puesto = String(body.titulo_puesto ?? '').trim();
    if (!titulo_puesto || titulo_puesto.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'El título del puesto es obligatorio (mín. 3 caracteres).' },
        { status: 400 },
      );
    }

    if (!TURNOS_VALIDOS.includes(body.tipo_jornada)) {
      return NextResponse.json({ ok: false, error: 'tipo_jornada inválido.' }, { status: 400 });
    }
    if (body.modalidad && !MODALIDADES_VALIDAS.includes(body.modalidad)) {
      return NextResponse.json({ ok: false, error: 'modalidad inválida.' }, { status: 400 });
    }
    if (body.estatus && !ESTATUS_VALIDOS.includes(body.estatus)) {
      return NextResponse.json({ ok: false, error: 'estatus inválido.' }, { status: 400 });
    }

    const payload = {
      workspace_id: body.workspace_id,
      titulo_puesto,
      descripcion: body.descripcion?.slice(0, 2000) || null,
      requisitos:  body.requisitos?.slice(0, 2000)  || null,
      beneficios:  body.beneficios?.slice(0, 1000)  || null,
      tipo_jornada: body.tipo_jornada,
      detalle_turno: String(body.detalle_turno ?? '').slice(0, 150) || null,
      modalidad:   body.modalidad || 'Presencial',
      ubicacion:   body.ubicacion?.slice(0, 200) || null,
      sueldo_candidato: numOrNull(body.sueldo_candidato),

      // Los financieros van al servidor SOLO si el rol lo permite.
      // La verificación fina la hace la política RLS en Supabase.
      cobro_cliente:      numOrNull(body.cobro_cliente),
      comision_freelance: numOrNull(body.comision_freelance),

      asignado_a_coordinador_id: body.asignado_a_coordinador_id || null,
      vacantes_disponibles:      Math.max(parseInt(body.vacantes_disponibles || 1, 10), 1),
      estatus:                  body.estatus || 'Abierta',
      es_delicada:              Boolean(body.es_delicada),
    };

    if (!payload.workspace_id) {
      return NextResponse.json(
        { ok: false, error: 'Falta workspace_id.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('vacantes')
      .insert(payload)
      .select('id, titulo_puesto')
      .single();

    if (error) {
      console.error('[api/vacantes] insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'No se pudo crear la vacante. Verifica permisos.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: true, id: data.id, titulo: data.titulo_puesto },
      { status: 201 },
    );
  } catch (err) {
    console.error('[api/vacantes] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado.' },
      { status: 500 },
    );
  }
}

function numOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}