// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase-admin';
import { HOME_POR_ROL } from '@/lib/routes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 *
 * Body: { nombre_empresa, nombre_completo, correo_corporativo, password }
 *
 * Flujo:
 *   1. Valida campos (longitudes, formato email, fuerza de contraseña).
 *   2. signUp con Supabase Auth (rol: Cliente_SaaS por metadata).
 *      El trigger `handle_new_user` crea el user_profiles automáticamente.
 *   3. Crea un workspace nuevo para la empresa (client_admin).
 *   4. Actualiza user_profiles con workspace_id y nombre.
 *   5. Inicia sesión y retorna la URL de redirección.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const nombre_empresa     = String(body.nombre_empresa     ?? '').trim();
    const nombre_completo    = String(body.nombre_completo    ?? '').trim();
    const correo_corporativo = String(body.correo_corporativo ?? '').trim().toLowerCase();
    const password           = String(body.password           ?? '');

    // Validaciones
    if (nombre_empresa.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'El nombre de la empresa es obligatorio.' },
        { status: 400 },
      );
    }
    if (nombre_completo.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Ingresa tu nombre completo.' },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(correo_corporativo)) {
      return NextResponse.json(
        { ok: false, error: 'Correo corporativo inválido.' },
        { status: 400 },
      );
    }
    if (password.length < 8) {
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

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try { cookieStore.set({ name, value, ...options }); } catch { /* noop */ }
          },
          remove(name, options) {
            try { cookieStore.set({ name, value: '', ...options }); } catch { /* noop */ }
          },
        },
      },
    );

    // 1) Crear usuario en Supabase Auth.
    //    Pasamos metadata para que el trigger handle_new_user asigne rol.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: correo_corporativo,
      password,
      options: {
        data: {
          nombre_completo,
          rol: 'Cliente_SaaS',
        },
      },
    });

    if (signUpError || !signUpData.user) {
      const msg =
        signUpError?.message?.toLowerCase().includes('already registered')
          ? 'Este correo ya está registrado. Inicia sesión.'
          : signUpError?.message || 'No se pudo crear la cuenta.';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const userId = signUpData.user.id;

    // 2) Crear workspace con service_role (bypassa RLS para esta operación
    //    de bootstrap).
    const admin = createAdminClient();
    const { data: workspace, error: wsError } = await admin
      .from('workspaces_empresas')
      .insert({
        nombre_empresa,
        plan_activo: 'Trial',
        giro_industrial: 'Otro',
        activo: true,
      })
      .select('id')
      .single();

    if (wsError || !workspace) {
      console.error('[register] workspace error:', wsError);
      return NextResponse.json(
        { ok: false, error: 'No se pudo crear el espacio de trabajo. Intenta de nuevo.' },
        { status: 500 },
      );
    }

    // 3) Actualizar user_profiles (nombre + workspace_id).
    const { error: profileError } = await admin
      .from('user_profiles')
      .update({
        nombre_completo,
        workspace_id: workspace.id,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('[register] profile error:', profileError);
    }

    // 4) Si Supabase requiere confirmación por email y no creó sesión,
    //    le pedimos que confirme primero.
    if (!signUpData.session) {
      return NextResponse.json({
        ok: true,
        requiresEmailConfirmation: true,
        redirect: '/login?registered=1',
        message: 'Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.',
      });
    }

    return NextResponse.json({
      ok: true,
      redirect: HOME_POR_ROL.Cliente_SaaS,
      user: {
        id: userId,
        email: correo_corporativo,
        rol: 'Cliente_SaaS',
        nombre_completo,
        workspace_id: workspace.id,
      },
    });
  } catch (err) {
    console.error('[api/auth/register] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado al crear la cuenta.' },
      { status: 500 },
    );
  }
}