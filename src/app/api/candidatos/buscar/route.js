import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { HISTORIAL_DEMO, DEDUPE_DEMO_KEYS } from '@/lib/candidatos-mock';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/candidatos/buscar?email=...&telefono=...
 *
 * Busca un candidato existente por correo O teléfono.
 * Si encuentra, devuelve también su historial de participación
 * en vacantes (vacantes_participadas, inasistencias, abandonos
 * y las últimas 5 postulaciones).
 *
 * Si no encuentra → 404 con { ok: true, found: false }.
 *
 * Modo demo (?demo=1): usa el mock HISTORIAL_DEMO para previsualizar.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const demoMode = searchParams.get('demo') === '1';
    const email    = String(searchParams.get('email')    ?? '').trim().toLowerCase();
    const telefono = String(searchParams.get('telefono') ?? '').trim();

    if (!email && !telefono) {
      return NextResponse.json(
        { ok: false, error: 'Debes enviar al menos email o teléfono.' },
        { status: 400 },
      );
    }

    // ─────────────────────────────────────────────────────────
    //  MODO DEMO
    // ─────────────────────────────────────────────────────────
    if (demoMode) {
      const emailMatch = email    && DEDUPE_DEMO_KEYS.correos.includes(email);
      const phoneMatch = telefono && DEDUPE_DEMO_KEYS.telefonos.includes(telefono);

      if (!emailMatch && !phoneMatch) {
        return NextResponse.json({ ok: true, found: false, demo: true }, { status: 200 });
      }

      return NextResponse.json({
        ok: true,
        found: true,
        demo: true,
        candidato: HISTORIAL_DEMO.candidato,
        historial: HISTORIAL_DEMO.historial,
      });
    }

    // ─────────────────────────────────────────────────────────
    //  MODO REAL (Supabase)
    // ─────────────────────────────────────────────────────────
    const supabase = createAdminClient();

    let candidato = null;
    let queryError = null;

    if (email) {
      const r = await supabase
        .from('candidatos')
        .select('id, nombre_completo, correo, telefono, edad, escolaridad, estado, municipio, vacantes_participadas, inasistencias, abandonos, created_at')
        .ilike('correo', email)
        .maybeSingle();
      candidato = r.data;
      queryError = r.error;
    }

    if (!candidato && telefono) {
      const r = await supabase
        .from('candidatos')
        .select('id, nombre_completo, correo, telefono, edad, escolaridad, estado, municipio, vacantes_participadas, inasistencias, abandonos, created_at')
        .eq('telefono', telefono)
        .maybeSingle();
      candidato = r.data;
      queryError = r.error;
    }

    if (queryError) {
      console.error('[api/candidatos/buscar] error:', queryError);
      return NextResponse.json({ ok: false, error: 'Error en la búsqueda.' }, { status: 500 });
    }

    if (!candidato) {
      return NextResponse.json({ ok: true, found: false }, { status: 200 });
    }

    // Historial: postulaciones previas
    const { data: historial, error: hErr } = await supabase
      .from('vacante_candidatos')
      .select(`
        id,
        estatus,
        puntuacion,
        asistido,
        created_at,
        vacante:vacantes (
          id,
          titulo_puesto,
          workspace_id,
          workspace:workspaces_empresas ( nombre_empresa )
        )
      `)
      .eq('candidato_id', candidato.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (hErr) {
      console.error('[api/candidatos/buscar] historial error:', hErr);
    }

    return NextResponse.json({
      ok: true,
      found: true,
      candidato,
      historial: (historial || []).map((h) => ({
        id: h.id,
        estatus: h.estatus,
        puntuacion: h.puntuacion,
        asistido: h.asistido,
        fecha: h.created_at,
        vacante: h.vacante?.titulo_puesto,
        empresa: Array.isArray(h.vacante?.workspace) ? h.vacante.workspace[0]?.nombre_empresa : h.vacante?.workspace?.nombre_empresa,
      })),
    });
  } catch (err) {
    console.error('[api/candidatos/buscar] unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}