// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import {
  isStripeConfigured,
  createCheckoutSession,
  buildDemoCheckoutUrl,
} from '@/lib/stripe';
import { getFacturaById } from '@/lib/facturas-data';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * POST /api/facturas/[id]/checkout
 *
 * Body (opcional): { clienteEmail? }
 *
 * Crea una sesión de Stripe Checkout (o una URL de demo) y la devuelve.
 *
 * Si STRIPE_SECRET_KEY no está configurada → modo DEMO:
 *   devuelve una URL que apunta al callback local con ?demo=1
 *   (más adelante el callback actualizará el estatus a Pagada).
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    let body = {};
    try { body = await request.json(); } catch { /* empty */ }
    const clienteEmail = body.clienteEmail || undefined;

    // 1) Verificar que la factura existe y está pendiente
    const supabase = createAdminClient();
    let factura = null;
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
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
    if (factura.estatus === 'Cancelada') {
      return NextResponse.json({ ok: false, error: 'Esta factura fue cancelada.' }, { status: 400 });
    }

    // 2) MODO DEMO (sin Stripe configurado)
    if (!isStripeConfigured()) {
      const url = buildDemoCheckoutUrl({ facturaId: id });
      return NextResponse.json({
        ok: true,
        demo: true,
        url,
        message: 'Modo demo: sin STRIPE_SECRET_KEY. Serás redirigido al callback local con ?demo=1',
      });
    }

    // 3) MODO REAL: crear sesión de Stripe
    try {
      const { url, sessionId } = await createCheckoutSession({
        facturaId: id,
        monto: Number(factura.monto),
        moneda: factura.moneda || 'mxn',
        descripcion: factura.descripcion || `Factura HR CORE #${id.slice(0, 8)}`,
        clienteEmail,
      });

      // Guardar el session_id para reconciliar después via webhook
      await supabase
        .from('facturas')
        .update({
          metodo_pago: 'Tarjeta',
          referencia_externa: sessionId,
        })
        .eq('id', id);

      return NextResponse.json({ ok: true, url, sessionId });
    } catch (stripeErr) {
      console.error('[api/checkout] Stripe error:', stripeErr);
      // Fallback a demo si Stripe falla
      const url = buildDemoCheckoutUrl({ facturaId: id });
      return NextResponse.json({
        ok: true,
        demo: true,
        url,
        message: 'Stripe no disponible — usando demo.',
      });
    }
  } catch (err) {
    console.error('[api/checkout] error:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}