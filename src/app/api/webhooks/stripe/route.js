/**
 * ============================================================
 *  /api/webhooks/stripe  ·  HR CORE
 * ============================================================
 *
 *  Webhook de Stripe. Se llama automáticamente cuando ocurre un
 *  evento en Stripe (ej. `checkout.session.completed` o
 *  `payment_intent.succeeded`).
 *
 *  CONFIGURACIÓN EN STRIPE DASHBOARD
 *  ---------------------------------
 *  Dashboard → Developers → Webhooks → Add endpoint
 *  URL:      https://TU-DOMINIO.com/api/webhooks/stripe
 *  Eventos:  checkout.session.completed
 *            payment_intent.succeeded
 *            payment_intent.payment_failed
 *            charge.refunded
 *
 *  SEGURIDAD
 *  ---------
 *  1) Verificamos la firma con STRIPE_WEBHOOK_SECRET.
 *  2) Si STRIPE no está configurado, respondemos 200 (modo demo).
 *  3) Solo procesamos pagos con `payment_status === 'paid'`.
 *  4) La factura se vincula por `metadata.factura_id` que pusimos
 *     al crear la sesión de Checkout.
 *
 *  ENDPOINTS EN VERCEL
 *  -------------------
 *  El endpoint debe estar disponible públicamente (no protegido
 *  por el middleware) para que Stripe pueda llamarlo. El matcher
 *  del middleware excluye /api/ así que ya está OK.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getStripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Stripe requiere el body crudo (no parsed JSON) para verificar
 * la firma. Por eso usamos `request.text()` en lugar de `request.json()`.
 */
export async function POST(request) {
  const stripe = getStripe();
  const webhookSecret = STRIPE_WEBHOOK_SECRET;

  // Modo demo (sin STRIPE_SECRET_KEY): respondemos 200 silenciosamente.
  if (!stripe || !webhookSecret) {
    return NextResponse.json({
      received: true,
      demo: true,
      message: 'Stripe no configurado — webhook en modo demo.',
    });
  }

  // 1) Leer el body crudo + firma del header
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  if (!sig) {
    return NextResponse.json(
      { error: 'Falta header stripe-signature.' },
      { status: 400 },
    );
  }

  // 2) Verificar la firma — esto rechaza cualquier request que
  //    no venga realmente de Stripe.
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Firma inválida:', err.message);
    return NextResponse.json(
      { error: `Firma inválida: ${err.message}` },
      { status: 400 },
    );
  }

  // 3) Manejo de eventos
  console.log('[stripe/webhook] Evento recibido:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await handlePaymentIntentSucceeded(intent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await handlePaymentFailed(intent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        // Evento que no nos interesa, pero respondemos 200 para que
        // Stripe no siga reintentando.
        console.log('[stripe/webhook] Evento ignorado:', event.type);
    }
  } catch (err) {
    console.error('[stripe/webhook] Error procesando evento:', err);
    // Devolvemos 500 para que Stripe reintente más tarde.
    return NextResponse.json(
      { error: 'Error interno procesando el evento.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true, type: event.type });
}

/* ============================================================
 *  Handlers por tipo de evento
 * ============================================================ */

/**
 * checkout.session.completed
 *
 *   Se dispara cuando el cliente completa el checkout de Stripe.
 *   Aquí actualizamos la factura a Pagada.
 *   El `metadata.factura_id` lo pusimos al crear la sesión.
 */
async function handleCheckoutCompleted(session) {
  if (session.payment_status !== 'paid') {
    console.log('[stripe/webhook] session.completed pero no paid:', session.payment_status);
    return;
  }

  const facturaId = session.metadata?.factura_id;
  if (!facturaId) {
    console.warn('[stripe/webhook] session sin metadata.factura_id');
    return;
  }

  await marcarFacturaPagada(facturaId, {
    metodo_pago: 'Tarjeta',
    referencia_externa: session.id,
    fecha_pago: new Date().toISOString(),
  });
}

/**
 * payment_intent.succeeded
 *
 *   Se dispara cuando un PaymentIntent (no Checkout) se completa
 *   con éxito (ej. suscripciones, pagos recurrentes, o pagos
 *   con Stripe Elements). Usamos la misma lógica.
 */
async function handlePaymentIntentSucceeded(intent) {
  if (intent.status !== 'succeeded') return;

  // El metadata puede venir en el intent o en el charge asociado
  const facturaId = intent.metadata?.factura_id;
  if (!facturaId) {
    console.warn('[stripe/webhook] payment_intent sin metadata.factura_id');
    return;
  }

  await marcarFacturaPagada(facturaId, {
    metodo_pago: 'Tarjeta',
    referencia_externa: intent.id,
    fecha_pago: new Date().toISOString(),
  });
}

/**
 * payment_intent.payment_failed
 *
 *   Marcamos la factura como Cancelada para que no quede
 *   en estado pendiente eternamente.
 */
async function handlePaymentFailed(intent) {
  const facturaId = intent.metadata?.factura_id;
  if (!facturaId) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('facturas')
    .update({ estatus: 'Cancelada', notas_internas: `Pago fallido: ${intent.last_payment_error?.message || 'desconocido'}` })
    .eq('id', facturaId)
    .eq('estatus', 'Pendiente'); // Solo si todavía no estaba pagada
  if (error) console.error('[stripe/webhook] error al cancelar:', error);
  else      console.log('[stripe/webhook] Factura cancelada:', facturaId);
}

/**
 * charge.refunded
 *
 *   Si el cliente pidió un reembolso, dejamos la factura con el
 *   estatus Cancelada y guardamos la referencia del refund.
 */
async function handleChargeRefunded(charge) {
  // Buscar la factura por referencia_externa (que guardamos al pagar)
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('facturas')
    .select('id, estatus')
    .eq('referencia_externa', charge.payment_intent || charge.id)
    .maybeSingle();

  if (error || !data) {
    console.log('[stripe/webhook] refund sin factura asociada:', charge.id);
    return;
  }

  const { error: upErr } = await supabase
    .from('facturas')
    .update({
      estatus: 'Cancelada',
      notas_internas: `Reembolso Stripe: ${charge.id}`,
    })
    .eq('id', data.id);
  if (upErr) console.error('[stripe/webhook] error al marcar refund:', upErr);
  else      console.log('[stripe/webhook] Factura reembolsada:', data.id);
}

/* ============================================================
 *  Helper compartido
 * ============================================================ */
async function marcarFacturaPagada(facturaId, { metodo_pago, referencia_externa, fecha_pago }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('facturas')
    .update({
      estatus: 'Pagada',
      metodo_pago,
      referencia_externa,
      fecha_pago,
    })
    .eq('id', facturaId)
    .select('id, estatus, monto')
    .single();

  if (error) {
    console.error('[stripe/webhook] Error al marcar pagada:', error);
    throw error;
  }
  console.log('[stripe/webhook] ✅ Factura pagada:', data.id, '$' + data.monto);
}