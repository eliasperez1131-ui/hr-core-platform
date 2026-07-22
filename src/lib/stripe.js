/**
 * ============================================================
 *  HR CORE · Cliente Stripe (server-side)
 * ============================================================
 *
 *  Si STRIPE_SECRET_KEY está configurada en .env.local, inicializamos
 *  el SDK real. Si NO está, todas las funciones devuelven null y los
 *  endpoints activan automáticamente el modo DEMO (simulación).
 *
 *  En producción:
 *    STRIPE_SECRET_KEY=sk_live_xxx
 *    NEXT_PUBLIC_APP_URL=https://hrcore.app
 *    STRIPE_WEBHOOK_SECRET=whsec_xxx
 */

const SECRET = process.env.STRIPE_SECRET_KEY || null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || null;

let _stripe = null;

export function getStripe() {
  if (!SECRET) return null;
  if (_stripe) return _stripe;
  // Lazy import para no romper el build cuando no hay clave
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe');
  _stripe = new Stripe(SECRET, { apiVersion: '2024-06-20' });
  return _stripe;
}

export function isStripeConfigured() {
  return Boolean(SECRET);
}

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
export const STRIPE_APP_URL = APP_URL;
export const STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
export const STRIPE_SECRET_KEY_SET = Boolean(SECRET);
export const STRIPE_WEBHOOK_SECRET_SET = Boolean(WEBHOOK_SECRET);

/**
 * Crea una sesión de Stripe Checkout para pagar una factura.
 * @param {object} opts
 * @param {string} opts.facturaId
 * @param {number} opts.monto
 * @param {string} opts.moneda
 * @param {string} opts.descripcion
 * @param {string} opts.clienteEmail
 * @returns {Promise<{ url: string }>}
 */
export async function createCheckoutSession({ facturaId, monto, moneda = 'mxn', descripcion, clienteEmail }) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe no configurado');

  const amountInCents = Math.round(Number(monto) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: clienteEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: moneda.toLowerCase(),
          product_data: {
            name: descripcion || `Factura HR CORE`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      factura_id: facturaId,
    },
    success_url: `${APP_URL}/portal-cliente?tab=facturacion&paid=1&factura=${facturaId}`,
    cancel_url:  `${APP_URL}/portal-cliente?tab=facturacion&cancelled=1&factura=${facturaId}`,
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Recupera una sesión de checkout para verificar el estado del pago.
 */
export async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe no configurado');
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Helper de modo demo — se usa cuando no hay STRIPE_SECRET_KEY.
 * Simula un checkout exitoso y devuelve una URL al callback local.
 */
export function buildDemoCheckoutUrl({ facturaId }) {
  const base = APP_URL;
  return `${base}/portal-cliente?tab=facturacion&paid=1&factura=${facturaId}&demo=1`;
}