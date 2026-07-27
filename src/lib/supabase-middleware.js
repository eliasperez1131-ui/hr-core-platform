/**
 * ============================================================
 *  HR CORE · Cliente "middleware" (equiv a supabase-middleware.js)
 * ============================================================
 *  Usado por src/middleware.js para refrescar la sesion JWT.
 * ============================================================
 */

import { NextResponse } from 'next/server';
import { getSession, setSessionCookie, clearSessionCookie } from '@/lib/session';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export async function refreshSession(request, response) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return { user: null };

  const session = await getSession();
  if (!session) {
    // Token expirado: limpiamos la cookie
    response.cookies.delete(SESSION_COOKIE_NAME);
    return { user: null };
  }

  return { user: session };
}

export function buildResponse(request) {
  return NextResponse.next({ request: { headers: request.headers } });
}
