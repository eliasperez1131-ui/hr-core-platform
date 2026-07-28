import { NextResponse } from 'next/server';
import { query } from '@/lib/db-mysql';
import { getSession } from '@/lib/session';
import { getCurrentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notificaciones
 *
 * Devuelve las ultimas 20 notificaciones del usuario actual.
 * Como la BD no tiene tabla 'notificaciones' todavia,
 * devuelve una lista vacia con la estructura correcta.
 */
export async function GET(request) {
  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return NextResponse.json({ ok: true, notificaciones: [] });
    }

    // Por ahora no hay tabla de notificaciones en MySQL.
    // Cuando exista, aqui iria:
    //
    //   const rows = await query(
    //     `SELECT id, tipo, titulo, mensaje, leida, created_at
    //        FROM notificaciones
    //       WHERE user_id = ? OR workspace_id = ?
    //       ORDER BY created_at DESC
    //       LIMIT 20`,
    //     [user.id, user.workspace_id]
    //   );
    //   return NextResponse.json({ ok: true, notificaciones: rows });

    return NextResponse.json({ ok: true, notificaciones: [] });
  } catch (err) {
    console.error('[api/notificaciones] error:', err);
    return NextResponse.json({ ok: true, notificaciones: [] });
  }
}
