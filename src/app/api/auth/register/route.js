import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db-mysql';
import { signSession, setSessionCookie } from '@/lib/session';
import { generateTokenAcceso } from '@/lib/seguro';
import { resolveEmail } from '@/lib/auth-aliase';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 *
 * Crea un usuario nuevo en MySQL + su sesion JWT.
 * Genera token_acceso (ALFABETO_SEGURO) para que pueda usar el portal candidato.
 *
 * Cambios vs Supabase:
 *  - INSERT directo a MySQL (no auth.signUp de Supabase)
 *  - Genera sesion JWT propia + setea cookie
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const emailRaw = String(body.email ?? '').trim();
    const password = String(body.password ?? '');
    const nombre_completo = String(body.nombre_completo ?? body.options?.data?.nombre_completo ?? '').trim();
    const workspace_id = body.workspace_id || null;

    if (!EMAIL_RE.test(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa un correo electrónico válido.' },
        { status: 400 },
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 },
      );
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe incluir al menos una letra y un número.' },
        { status: 400 },
      );
    }
    if (!nombre_completo || nombre_completo.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa tu nombre completo.' },
        { status: 400 },
      );
    }

    const email = emailRaw.toLowerCase();
    const userId = randomUUID();

    // Verificar email duplicado
    const exists = await queryOne('SELECT id FROM user_profiles WHERE email = ?', [email]);
    if (exists) {
      return NextResponse.json(
        { ok: false, error: 'Este correo ya está registrado. Inicia sesión.' },
        { status: 400 },
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const token_acceso = generateTokenAcceso(7);

    await query(
      `INSERT INTO user_profiles
         (id, email, password_hash, nombre_completo, rol, workspace_id, token_acceso, activo, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Cliente_Invitado', ?, ?, 1, NOW(), NOW())`,
      [userId, email, password_hash, nombre_completo, workspace_id, token_acceso],
    );

    // Si se proporcionó workspace_id, crearlo
    if (workspace_id) {
      const wsExists = await queryOne('SELECT id FROM workspaces_empresas WHERE id = ?', [workspace_id]);
      if (!wsExists) {
        await query(
          `INSERT INTO workspaces_empresas (id, nombre_empresa, plan_activo, activo, created_at, updated_at)
           VALUES (?, ?, 'Trial', 1, NOW(), NOW())`,
          [workspace_id, nombre_completo + ' Workspace'],
        );
      }
    }

    // Crear sesion JWT
    const token = await signSession({
      sub:          userId,
      email,
      nombre:      nombre_completo,
      rol:          'Cliente_Invitado',
      workspace_id: workspace_id,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirect: '/dashboard-saas',
      user: { id: userId, email, nombre_completo, rol: 'Cliente_Invitado', workspace_id },
    });
  } catch (err) {
    console.error('[api/auth/register] error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno al crear la cuenta.' }, { status: 500 });
  }
}
