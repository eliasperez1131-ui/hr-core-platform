/**
 * ============================================================
 *  HR CORE · Sesiones con JWT propio (reemplaza Supabase Auth)
 * ============================================================
 *  Usa jose para firmar/verificar JWT.
 *  Cookie httpOnly con SameSite=Lax, duración 7 días.
 * ============================================================
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

const COOKIE_NAME = 'hrcore_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.HRCORE_JWT_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET no está configurado en .env.production');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Genera un JWT firmado con la info del usuario.
 */
export async function signSession(payload) {
  const { sub, email, nombre, rol, workspace_id } = payload;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + COOKIE_MAX_AGE;

  return await new SignJWT({ email, nombre, rol, workspace_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecret());
}

/**
 * Verifica y decodifica un JWT.
 */
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Hashea un token (para "remember me", CSRF, etc).
 * Usa SHA-256 con un salt aleatorio.
 */
export function hashToken(token) {
  return createHash('sha256')
    .update(token + (process.env.HRCORE_TOKEN_SALT || 'hrcore-default-salt'))
    .digest('hex');
}

/**
 * Genera un token aleatorio (para invitaciones, magic links, etc).
 */
export function generateToken(length = 32) {
  return randomBytes(length).toString('hex');
}

/**
 * Setea la cookie de sesion en el response (server actions/route handlers).
 */
export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set({
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   COOKIE_MAX_AGE,
  });
}

/**
 * Lee la sesion del usuario desde la cookie (Server Components).
 * Retorna null si no hay sesion valida.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySession(token);
}

/**
 * Elimina la cookie de sesion (logout).
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = COOKIE_MAX_AGE;
