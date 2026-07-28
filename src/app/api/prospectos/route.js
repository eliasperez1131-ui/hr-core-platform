import { NextResponse } from 'next/server';
import { query } from '@/lib/db-mysql';
import { getCurrentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: true, prospectos: [] });
    }
    const rows = await query(
      `SELECT * FROM prospectos_pendientes
        ORDER BY created_at DESC
        LIMIT 200`,
    );
    return NextResponse.json({ ok: true, prospectos: rows });
  } catch (err) {
    console.error('[api/prospectos] error:', err);
    return NextResponse.json({ ok: true, prospectos: [] });
  }
}
