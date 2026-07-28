import { NextResponse } from 'next/server';
import { query } from '@/lib/db-mysql';
import { getCurrentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: true, facturas: [] });
    }
    const rows = await query(
      `SELECT * FROM facturas
        WHERE workspace_id = ?
        ORDER BY created_at DESC
        LIMIT 200`,
      [user.workspace_id],
    );
    return NextResponse.json({ ok: true, facturas: rows });
  } catch (err) {
    console.error('[api/facturas] error:', err);
    return NextResponse.json({ ok: true, facturas: [] });
  }
}
