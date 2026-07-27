/**
 * ============================================================
 *  HR CORE · Cliente "server" (equiv a supabase-server.js)
 * ============================================================
 *  Wrapper que reemplaza al cliente Supabase en server components
 *  y route handlers. Internamente usa db-mysql + session.
 * ============================================================
 */

import { query, queryOne, insert, update, getPool } from '@/lib/db-mysql';
import { getSession } from '@/lib/session';

export { query, queryOne, insert, update, getPool };

/**
 * Devuelve el usuario actual desde la sesion.
 * Equivalente a `supabase.auth.getUser()`.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session || !session.sub) return { data: { user: null }, error: null };

  const user = await queryOne(
    'SELECT id, email, nombre_completo, rol, workspace_id, activo FROM user_profiles WHERE id = ? AND activo = 1',
    [session.sub],
  );
  if (!user) return { data: { user: null }, error: { message: 'User not found' } };
  return { data: { user }, error: null };
}

/**
 * Helper para obtener el admin pool de mysql2.
 */
export { getPool };
