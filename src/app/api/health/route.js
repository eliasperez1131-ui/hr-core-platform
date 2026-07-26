import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/health
 *
 * Endpoint de diagnóstico. Devuelve:
 *  - status:      'ok' | 'degraded' | 'down'
 *  - checks:      estado de cada subsistema
 *  - env:         variables de entorno críticas (booleano, NO valores)
 *  - timestamp:   ISO timestamp
 *
 * USO:
 *   curl https://tudominio.com/api/health
 *
 * Si Supabase falla, este endpoint lo reporta en `checks.supabase` sin
 * tumbar la respuesta. Sirve para verificar el estado en producción.
 */
export async function GET() {
  const checks = {
    server:   { ok: true, message: 'Next.js running' },
    supabase: { ok: false, message: 'Not checked' },
  };

  const env = {
    NEXT_PUBLIC_SUPABASE_URL:    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY:     Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SITE_URL:         Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_APP_NAME:          Boolean(process.env.NEXT_PUBLIC_APP_NAME),
    STRIPE_SECRET_KEY:            Boolean(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET:        Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    RESEND_API_KEY:               Boolean(process.env.RESEND_API_KEY),
  };

  // Test conexión a Supabase
  try {
    const supabase = createAdminClient();
    const { error, count } = await supabase
      .from('candidatos')
      .select('id', { count: 'exact', head: true });
    if (error) {
      checks.supabase = { ok: false, message: error.message };
    } else {
      checks.supabase = {
        ok: true,
        message: `Connected. ${count ?? 0} candidatos en BD.`,
      };
    }
  } catch (err) {
    checks.supabase = {
      ok: false,
      message: `Connection failed: ${err?.message || err}`,
    };
  }

  // Verificar si la tabla user_profiles existe (común problema de deploy)
  let tablesExist = { user_profiles: false, workspaces_empresas: false };
  if (checks.supabase.ok) {
    try {
      const supabase = createAdminClient();
      const [a, b] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('workspaces_empresas').select('id', { count: 'exact', head: true }),
      ]);
      tablesExist.user_profiles       = !a.error && (a.count ?? 0) >= 0;
      tablesExist.workspaces_empresas = !b.error && (b.count ?? 0) >= 0;
    } catch { /* noop */ }
  }

  const status = checks.supabase.ok && tablesExist.user_profiles ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    service: 'HR CORE',
    env,
    checks,
    tables: tablesExist,
    hint: tablesExist.user_profiles
      ? 'Todo en orden ✅'
      : '⚠️ La tabla user_profiles NO existe. Ejecuta sql/00_run_all.sql en Supabase SQL Editor.',
    timestamp: new Date().toISOString(),
  }, {
    status: status === 'ok' ? 200 : 503,
  });
}