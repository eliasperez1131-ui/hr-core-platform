// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/vacante-candidatos
 *
 * Vincula un candidato (existente o recién creado) a una vacante.
 *
 * Body:
 *   {
 *     candidato_id: UUID,
 *     vacante_id:   UUID,
 *     notas?:       string,
 *   }
 *
 * Si el candidato ya estaba vinculado → 409 con detalle.
 * Si la vacante es `es_delicada = true`, el candidato entra con
 * estatus "Pendiente de Aprobación" y NO se marca como visible_cliente.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const candidato_id = String(body.candidato_id ?? '');
    const vacante_id   = String(body.vacante_id   ?? '');

    if (!candidato_id || !vacante_id) {
      return NextResponse.json(
        { ok: false, error: 'Faltan candidato_id o vacante_id.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Traer la vacante para verificar es_delicada.
    const { data: vacante, error: vErr } = await supabase
      .from('vacantes')
      .select('id, titulo_puesto, es_delicada, estatus')
      .eq('id', vacante_id)
      .single();

    if (vErr || !vacante) {
      return NextResponse.json(
        { ok: false, error: 'La vacante no existe.' },
        { status: 404 },
      );
    }

    // Verificar duplicado de vínculo
    const { data: yaVinculado } = await supabase
      .from('vacante_candidatos')
      .select('id, estatus')
      .eq('candidato_id', candidato_id)
      .eq('vacante_id', vacante_id)
      .maybeSingle();

    if (yaVinculado) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          estatus_actual: yaVinculado.estatus,
          error: 'El candidato ya está vinculado a esta vacante.',
        },
        { status: 409 },
      );
    }

    const esDelicada = Boolean(vacante.es_delicada);

    const payload = {
      candidato_id,
      vacante_id,
      estatus:          esDelicada ? 'Pendiente de Aprobación' : 'Postulado',
      visible_cliente:  !esDelicada,
      notas:            body.notas?.slice(0, 500) || null,
    };

    const { data, error } = await supabase
      .from('vacante_candidatos')
      .insert(payload)
      .select('id, estatus, created_at')
      .single();

    if (error || !data) {
      if (error?.code === '23505') {
        return NextResponse.json(
          { ok: false, duplicate: true, error: 'Ya existe el vínculo (carrera detectada).' },
          { status: 409 },
        );
      }
      console.error('[api/vacante-candidatos] insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'No se pudo vincular el candidato.' },
        { status: 500 },
      );
    }

    // Actualizar métricas del candidato
    await supabase.rpc ? null : null;
    await supabase
      .from('candidatos')
      .update({ vacantes_participadas: supabase.rpc ? null : undefined })
      .eq('id', candidato_id);

    // Incremento atómico vía SQL embebido (Supabase JS no tiene $inc).
    await supabase.rpc('increment_candidato_participacion', { cid: candidato_id })
      .then(() => {}, () => {
        // Si el RPC no existe, hacer update best-effort.
        supabase
          .from('candidatos')
          .select('vacantes_participadas')
          .eq('id', candidato_id)
          .single()
          .then(({ data: c }) => {
            if (c) {
              supabase
                .from('candidatos')
                .update({ vacantes_participadas: (c.vacantes_participadas || 0) + 1 })
                .eq('id', candidato_id)
                .then(() => {}, () => {});
            }
          }, () => {});
      });

    return NextResponse.json({
      ok: true,
      vinculo: data,
      requiere_aprobacion: esDelicada,
      message: esDelicada
        ? 'Candidato en bandeja del Coordinador para aprobación (vacante delicada).'
        : 'Candidato vinculado a la vacante.',
    }, { status: 201 });
  } catch (err) {
    console.error('[api/vacante-candidatos] unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}