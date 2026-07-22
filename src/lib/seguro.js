/**
 * ============================================================
 *  Generador de tokens con ALFABETO SEGURO
 * ============================================================
 *
 *  Excluye caracteres ambiguos para evitar errores de captura
 *  (UX al transcribir manualmente desde un correo/WhatsApp).
 *
 *  Excluidos:
 *    O (letra) ↔ 0 (cero)
 *    I (letra) ↔ 1 (uno)
 *    L (letra) ↔ 1 (uno)
 *
 *  Resultado: 32 caracteres únicos en el alfabeto.
 *
 *    32 chars  →  ~1 billón de combinaciones (longitud 7)
 *                 suficiente para evitar colisiones.
 * ============================================================
 */

export const ALFABETO_SEGURO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const TOKEN_LONGITUD_MIN = 6;
export const TOKEN_LONGITUD_MAX = 8;
export const TOKEN_LONGITUD_DEFAULT = 7;

/**
 * Genera un token aleatorio de longitud entre 6 y 8 usando
 * el ALFABETO_SEGURO. Usa crypto.getRandomValues (criptográficamente
 * seguro) y acepta longitud explícita.
 *
 * @param {number} longitud - entre 6 y 8 (default 7)
 * @returns {string}
 */
export function generateTokenAcceso(longitud = TOKEN_LONGITUD_DEFAULT) {
  const n = Math.max(TOKEN_LONGITUD_MIN, Math.min(TOKEN_LONGITUD_MAX, longitud | 0));
  const arr = new Uint32Array(n);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    // Fallback (SSR / entornos sin WebCrypto) — menos seguro pero funcional.
    for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * 0xffffffff);
  }

  let out = '';
  for (let i = 0; i < n; i++) {
    out += ALFABETO_SEGURO[arr[i] % ALFABETO_SEGURO.length];
  }
  return out;
}

/**
 * Valida que un string YA NORMALIZADO cumpla las reglas del alfabeto seguro.
 *  - Solo mayúsculas y números
 *  - Sin O, 0, I, L, 1
 *  - Longitud entre 6 y 8
 *
 * NOTA: NO hace uppercase automáticamente. Para validar input crudo
 * del usuario, primero llamar a `normalizeToken(token)` y luego aquí.
 *
 * @param {string} tokenNormalizado
 * @returns {boolean}
 */
export function isValidTokenFormat(token) {
  if (typeof token !== 'string') return false;
  if (token.length < TOKEN_LONGITUD_MIN || token.length > TOKEN_LONGITUD_MAX) return false;
  for (const ch of token) {
    if (!ALFABETO_SEGURO.includes(ch)) return false;
  }
  return true;
}

/**
 * Normaliza un token entrado por el usuario: trim + uppercase.
 */
export function normalizeToken(token) {
  return String(token || '').trim().toUpperCase();
}

/**
 * Normaliza un teléfono: solo dígitos (sin +, espacios, paréntesis).
 */
export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Formatea un token en grupos de 4 chars para mejor lectura:
 *   "ABC23DEF" → "ABC2 3DEF"
 */
export function formatTokenDisplay(token) {
  const t = normalizeToken(token);
  return t.match(/.{1,4}/g)?.join(' ') || t;
}