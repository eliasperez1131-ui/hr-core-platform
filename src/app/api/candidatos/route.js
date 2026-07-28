import { NextResponse } from 'next/server';
import { query } from '@/lib/db-mysql';
import { getCurrentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: true, candidatos: [] });
    }
    const rows = await query(
      `SELECT * FROM candidatos
        WHERE workspace_id = ?
        ORDER BY created_at DESC
        LIMIT 200`,
      [user.workspace_id],
    );
    return NextResponse.json({ ok: true, candidatos: rows });
  } catch (err) {
    console.error('[api/candidatos] error:', err);
    return NextResponse.json({ ok: true, candidatos: [] });
  }
}
