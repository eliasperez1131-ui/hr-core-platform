import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db-mysql';
import { signSession, setSessionCookie } from '@/lib/session';
import { normalizeToken, normalizePhone } from '@/lib/seguro';
import { HOME_POR_ROL } from '@/lib/routes';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 *   Tambien acepta { email: 'ADMIN' } y lo transforma
 *   a 'admin@hrcore.com.mx' (alias del super admin).
 *
 * Cambios vs la version con Supabase:
 *  - Lee el user desde MySQL con queryOne
 *  - Verifica password con bcrypt.compare (no Supabase)
 *  - Genera sesion JWT propia (no Supabase)
 *  - Setea cookie httpOnly (no Supabase)
 *  - Devuelve redirect segun el rol (HOME_POR_ROL)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const emailRaw = String(body.email ?? '');
    const password = String(body.password ?? '');
    const next     = typeof body.next === 'string' && body.next.startsWith('/') ? body.next : null;

    if (!EMAIL_RE.test(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa un correo electrónico válido.' },
        { status: 400 },
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña es obligatoria.' },
        { status: 400 },
      );
    }

    // Buscar usuario en MySQL
    const user = await queryOne(
      `SELECT id, email, nombre_completo, rol, workspace_id, activo, password_hash
         FROM user_profiles
        WHERE email = ?
        LIMIT 1`,
      [emailRaw.toLowerCase()],
    );

    if (!user || !user.activo) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 },
      );
    }

    // Verificar password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incorrectas. Verifica tu correo y contraseña.' },
        { status: 401 },
      );
    }

    // Generar sesion JWT
    const token = await signSession({
      sub:          user.id,
      email:        user.email,
      nombre:       user.nombre_completo,
      rol:          user.rol,
      workspace_id: user.workspace_id,
    });
    await setSessionCookie(token);

    // Devolver redirect segun el rol
    const redirect = next || HOME_POR_ROL[user.rol] || '/dashboard-saas';

    return NextResponse.json({
      ok: true,
      redirect,
      user: {
        id:              user.id,
        email:           user.email,
        nombre_completo: user.nombre_completo,
        rol:             user.rol,
        workspace_id:    user.workspace_id,
      },
    });
  } catch (err) {
    console.error('[api/auth/login] error:', err);
    return NextResponse.json(
      { ok: false, error: 'Error interno al iniciar sesion.' },
      { status: 500 },
    );
  }
}
