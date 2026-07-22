// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/evaluacion/submit
 *
 * Body:
 *   {
 *     candidato_id: string,
 *     respuestas:   { [reactivoId]: 1|2|3|4|5 },
 *     result:       { total, max, percent, percent_ajustado, baremo, por_dimension, ... },
 *     abandonos:    number,
 *     razon:        string,
 *     timestamp:    ISO string
 *   }
 *
 * Persiste:
 *   - Actualiza `vacante_candidatos.puntuacion` con el porcentaje
 *   - Marca el estatus correspondiente (Contratado / Apto / No Apto)
 *   - Incrementa `candidatos.inasistencias` si la prueba se canceló
 *
 * NOTA: el banco de preguntas (90 reactivos) está hardcoded en
 * src/lib/evaluation/integrity-test.js. Si más adelante quieres
 * tener varios bancos, conviene mover el id "INT-01" a una
 * columna catalogo_pruebas y resolver por catálogo.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const candidato_id = String(body.candidato_id || '');
    const respuestas   = body.respuestas || {};
    const result       = body.result;
    const abandonos    = Number(body.abandonos || 0);
    const razon        = String(body.razon || '');

    if (!candidato_id || candidato_id === 'demo') {
      return NextResponse.json({ ok: true, demo: true, message: 'Resultado no persistido (demo).' });
    }

    if (!result || typeof result.percent_ajustado !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Resultado inválido.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Decidir estatus final según baremo
    let nuevoEstatus = 'Postulado';
    if (razon.startsWith('Cancelada')) {
      nuevoEstatus = 'Inasistencia';
    } else if (result.baremo === 'Bajo') {
      nuevoEstatus = 'No Apto';
    } else if (result.baremo === 'Medio') {
      nuevoEstatus = 'Revisar';
    } else {
      // Alto / Muy Alto
      nuevoEstatus = 'Apto';
    }

    // 1) Actualizar todos los vínculos del candidato con la nueva puntuación
    const { data: updated, error: updErr } = await supabase
      .from('vacante_candidatos')
      .update({
        puntuacion: result.percent_ajustado,
        estatus:     nuevoEstatus,
      })
      .eq('candidato_id', candidato_id)
      .select('id, vacante_id, estatus');

    if (updErr) {
      console.error('[api/evaluacion/submit] update error:', updErr);
      return NextResponse.json({ ok: false, error: 'No se pudo guardar el resultado.' }, { status: 500 });
    }

    // 2) Si la prueba se canceló por abandono, incrementar inasistencias
    if (razon.startsWith('Cancelada')) {
      await supabase.rpc('increment_candidato_inasistencias', { cid: candidato_id })
        .then(() => {}, () => {
          // Fallback best-effort
          supabase
            .from('candidatos')
            .select('inasistencias')
            .eq('id', candidato_id)
            .single()
            .then(({ data: c }) => {
              if (c) {
                supabase
                  .from('candidatos')
                  .update({ inasistencias: (c.inasistencias || 0) + 1 })
                  .eq('id', candidato_id)
                  .then(() => {}, () => {});
              }
            }, () => {});
        });
    }

    return NextResponse.json({
      ok: true,
      candidato_id,
      estatus: nuevoEstatus,
      baremo:  result.baremo,
      percent_ajustado: result.percent_ajustado,
      vacantes_actualizadas: updated?.length || 0,
      abandonos,
    });
  } catch (err) {
    console.error('[api/evaluacion/submit] unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}