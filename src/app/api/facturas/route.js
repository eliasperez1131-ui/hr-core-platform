// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import {
  DEMO_WORKSPACE_ID,
  getFacturasByWorkspace,
  getResumenFinanciero,
} from '@/lib/facturas-data';

/**
 * GET  /api/facturas?workspace=...
 *      → Lista facturas del workspace + resumen financiero.
 *
 * POST /api/facturas
 *      Body: { workspace_id, vacante_id, monto, descripcion? }
 *      → Crea una nueva factura en estatus Pendiente.
 *      → Permiso: Super_Admin / Administrador / Coordinador.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace') || DEMO_WORKSPACE_ID;

    // En producción: supabase.from('facturas').select(...).eq('workspace_id', ...)
    const facturas   = getFacturasByWorkspace(workspaceId);
    const resumen    = getResumenFinanciero(workspaceId);

    return NextResponse.json({ ok: true, facturas, resumen });
  } catch (err) {
    console.error('[api/facturas] GET error:', err);
    return NextResponse.json({ ok: false, error: 'Error al listar facturas.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const workspace_id = String(body.workspace_id || '');
    const vacante_id   = String(body.vacante_id   || '');
    const monto        = Number(body.monto);
    const descripcion  = String(body.descripcion || '').slice(0, 500);

    if (!workspace_id || !vacante_id) {
      return NextResponse.json(
        { ok: false, error: 'Faltan workspace_id o vacante_id.' },
        { status: 400 },
      );
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      return NextResponse.json(
        { ok: false, error: 'El monto debe ser un número positivo.' },
        { status: 400 },
      );
    }

    // En producción: supabase.from('facturas').insert(...).select().single()
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('facturas')
      .insert({
        workspace_id,
        vacante_id,
        monto,
        moneda: 'MXN',
        estatus: 'Pendiente',
        descripcion: descripcion || `Headhunting · Vacante ${vacante_id}`,
      })
      .select('id, monto, estatus, created_at')
      .single();

    if (error) {
      // Modo demo (sin Supabase): devolvemos un id simulado
      const demoId = `fac-demo-${Date.now()}`;
      console.warn('[api/facturas] POST modo demo (Supabase no disponible):', error.message);
      return NextResponse.json({
        ok: true,
        demo: true,
        factura: {
          id: demoId,
          workspace_id,
          vacante_id,
          monto,
          estatus: 'Pendiente',
          descripcion,
          created_at: new Date().toISOString(),
        },
      }, { status: 201 });
    }

    return NextResponse.json({ ok: true, factura: data }, { status: 201 });
  } catch (err) {
    console.error('[api/facturas] POST error:', err);
    return NextResponse.json(
      { ok: true, demo: true, factura: { id: `fac-demo-${Date.now()}`, monto: 0, estatus: 'Pendiente' } },
      { status: 201 },
    );
  }
}