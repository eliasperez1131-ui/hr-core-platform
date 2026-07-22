// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getFacturaById } from '@/lib/facturas-data';

/**
 * POST /api/facturas/[id]/confirmar-transferencia
 *
 * Body: { referencia? , notas? }
 *
 * Cambia el estatus de la factura a "En_Revision" para que el
 * Super_Admin la apruebe manualmente tras validar la transferencia
 * bancaria.
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    let body = {};
    try { body = await request.json(); } catch { /* empty */ }
    const referencia = String(body.referencia || '').slice(0, 200);
    const notas      = String(body.notas || '').slice(0, 500);

    const supabase = createAdminClient();
    let factura = null;
    const { data, error } = await supabase
      .from('facturas')
      .select('id, estatus')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      factura = getFacturaById(id);
    } else {
      factura = data;
    }

    if (!factura) {
      return NextResponse.json({ ok: false, error: 'Factura no encontrada.' }, { status: 404 });
    }
    if (factura.estatus === 'Pagada') {
      return NextResponse.json({ ok: false, error: 'Esta factura ya fue pagada.' }, { status: 400 });
    }

    const patch = {
      estatus: 'En_Revision',
      metodo_pago: 'Transferencia',
    };
    if (referencia) patch.referencia_externa = `TRANSF:${referencia}`;
    if (notas)      patch.notas_internas      = notas;

    const { data: updated, error: updErr } = await supabase
      .from('facturas')
      .update(patch)
      .eq('id', id)
      .select('id, estatus, metodo_pago')
      .single();

    if (updErr) {
      console.warn('[api/confirmar-transferencia] modo demo:', updErr.message);
      const demo = getFacturaById(id);
      if (demo) {
        Object.assign(demo, patch);
        return NextResponse.json({ ok: true, factura: demo, demo: true });
      }
      return NextResponse.json({ ok: false, error: 'No se pudo actualizar.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      factura: updated,
      message: 'Tu transferencia está en revisión. Te avisaremos cuando sea aprobada.',
    });
  } catch (err) {
    console.error('[api/confirmar-transferencia] error:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}