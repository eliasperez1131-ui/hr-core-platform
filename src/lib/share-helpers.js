import { randomBytes } from 'crypto';

/**
 * Genera un token URL-safe de 64 caracteres.
 * Usa crypto.randomBytes(32) → 32 bytes = 64 hex chars.
 */
export function generateShareToken() {
  return randomBytes(32).toString('hex');
}

export const DEFAULT_EXPIRY_DAYS = 7;

/**
 * Devuelve la URL absoluta del portal público para un token dado.
 */
export function buildShareUrl(token, baseUrl) {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/compartir/${token}`;
}

/**
 * Enmascara un correo para mostrarlo en el portal público:
 *   ana.reyes@gmail.com → a****@gmail.com
 */
export function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}****@${domain}`;
}

/**
 * Enmascara un teléfono para mostrarlo en el portal público:
 *   +52 55 4422 8831 → +52 ••• •••• 8831
 */
export function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `••• •••• ${last4}`;
}