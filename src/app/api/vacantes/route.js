import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db-mysql';
import { getCurrentUser } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET  /api/vacantes   - Lista las vacantes del workspace del usuario
 * POST /api/vacantes   - Crea una nueva vacante
 */
export async function GET(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });
    }

    const rows = await query(
      `SELECT v.*, we.nombre_empresa, COUNT(vc.id) AS candidatos_count
         FROM vacantes v
         LEFT JOIN workspaces_empresas we ON we.id = v.workspace_id
         LEFT JOIN vacante_candidatos vc ON vc.vacante_id = v.id
        WHERE v.workspace_id = ? OR v.wacante_id = ?
        GROUP BY v.id
        ORDER BY v.created_at DESC`,
      [user.workspace_id, user.id],
    );

    return NextResponse.json({ ok: true, vacantes: rows });
  } catch (err) {
    console.error('[api/vacantes] GET error:', err);
    return NextResponse.json({ ok: true, vacantes: [] });
  }
}

export async function POST(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 });
    }
    if (!['Super_Admin', 'Administrador_Agencia', 'Coordinador'].includes(user.rol)) {
      return NextResponse.json({ ok: false, error: 'Sin permisos.' }, { status: 403 });
    }

    const body = await request.json();
    const id = randomUUID();
    const titulo = String(body.titulo_puesto || '').trim();
    if (!titulo) {
      return NextResponse.json({ ok: false, error: 'El título es requerido.' }, { status: 400 });
    }

    await query(
      `INSERT INTO vacantes
         (id, titulo_puesto, descripcion, requisitos, beneficios, tipo_jornada, detalle_turno,
          modalidad, ubicacion, sueldo_candidato, cobro_cliente, comision_freelance,
          es_delicada, estatus, vacantes_disponibles, workspace_id, creado_por, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        titulo,
        body.descripcion || null,
        body.requisitos  || null,
        body.beneficios  || null,
        body.tipo_jornada || 'Fijo',
        body.detalle_turno || null,
        body.modalidad  || 'Presencial',
        body.ubicacion  || null,
        body.sueldo_candidato ? Number(body.sueldo_candidato) : null,
        body.cobro_cliente    ? Number(body.cobro_cliente)    : null,
        body.comision_freelance ? Number(body.comision_freelance) : null,
        body.es_delicada ? 1 : 0,
        body.estatus || 'Abierta',
        body.vacantes_disponibles || 1,
        user.workspace_id,
        user.id,
      ],
    );

    const nueva = await queryOne('SELECT * FROM vacantes WHERE id = ?', [id]);
    return NextResponse.json({ ok: true, vacante: nueva }, { status: 201 });
  } catch (err) {
    console.error('[api/vacantes] POST error:', err);
    return NextResponse.json({ ok: false, error: 'Error al crear la vacante.' }, { status: 500 });
  }
}
