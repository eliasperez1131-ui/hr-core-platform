import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db-mysql';
import { getCurrentUser } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET  /api/empresas   - Lista las empresas (solo Super_Admin)
 * POST /api/empresas   - Crea una nueva empresa
 */
export async function GET(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: true, empresas: [] });
    }
    if (user.rol !== 'Super_Admin') {
      return NextResponse.json({ ok: true, empresas: [] });
    }

    const rows = await query(
      `SELECT we.*, COUNT(DISTINCT up.id) AS users_count
         FROM workspaces_empresas we
         LEFT JOIN user_profiles up ON up.workspace_id = we.id
        GROUP BY we.id
        ORDER BY we.created_at DESC`,
    );
    return NextResponse.json({ ok: true, empresas: rows });
  } catch (err) {
    console.error('[api/empresas] error:', err);
    return NextResponse.json({ ok: true, empresas: [] });
  }
}

export async function POST(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });
    }
    if (user.rol !== 'Super_Admin') {
      return NextResponse.json({ ok: false, error: 'Sin permisos.' }, { status: 403 });
    }

    const body = await request.json();
    const nombre = String(body.nombre_empresa || '').trim();
    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'El nombre es requerido.' }, { status: 400 });
    }

    const id = randomUUID();
    const giro = body.giro_industrial || 'Otro';
    const plan = body.plan_activo || 'Trial';
    const username = body.username || nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);

    await query(
      `INSERT INTO workspaces_empresas
         (id, nombre_empresa, giro_industrial, plan_activo, max_usuarios, activo, created_at, updated_at)
       VALUES (?, ?, ?, ?, 10, 1, NOW(), NOW())`,
      [id, nombre, giro, plan],
    );

    const nueva = await queryOne('SELECT * FROM workspaces_empresas WHERE id = ?', [id]);
    return NextResponse.json({ ok: true, empresa: nueva }, { status: 201 });
  } catch (err) {
    console.error('[api/empresas] POST error:', err);
    return NextResponse.json({ ok: false, error: 'Error al crear la empresa.' }, { status: 500 });
  }
}
