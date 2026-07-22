// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getFacturaById } from '@/lib/facturas-data';

/**
 * GET  /api/facturas/[id]   → factura individual
 * PATCH /api/facturas/[id]   Body: { estatus, metodo_pago?, notas_internas?, fecha_pago? }
 *                          → Actualiza el estatus (pago interno, cancelación, etc.)
 */
export async function GET(_request, { params }) {
  try {
    const { id } = params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      // Fallback demo
      const demo = getFacturaById(id);
      if (demo) return NextResponse.json({ ok: true, factura: demo, demo: true });
      return NextResponse.json({ ok: false, error: 'Factura no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, factura: data });
  } catch (err) {
    console.error('[api/facturas/id] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const patch = {};
    if (body.estatus)        patch.estatus      = body.estatus;
    if (body.metodo_pago)    patch.metodo_pago  = body.metodo_pago;
    if (body.notas_internas) patch.notas_internas = String(body.notas_internas).slice(0, 1000);
    if (body.estatus === 'Pagada' && !body.fecha_pago) {
      patch.fecha_pago = new Date().toISOString();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nada que actualizar.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('facturas')
      .update(patch)
      .eq('id', id)
      .select('id, estatus, metodo_pago, fecha_pago')
      .single();

    if (error) {
      console.warn('[api/facturas/id] PATCH modo demo (Supabase no disponible):', error.message);
      // Demo fallback
      const demo = getFacturaById(id);
      if (!demo) return NextResponse.json({ ok: false, error: 'Factura no encontrada.' }, { status: 404 });
      Object.assign(demo, patch);
      return NextResponse.json({ ok: true, factura: demo, demo: true });
    }

    return NextResponse.json({ ok: true, factura: data });
  } catch (err) {
    console.error('[api/facturas/id] PATCH error:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}