// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { maskEmail, maskPhone, buildShareUrl } from '@/lib/share-helpers';
import { SHARE_DEMO_TOKEN, getDemoShareData } from '@/lib/share-mock';

/**
 * GET /api/share/[token]
 *
 * Devuelve la información pública de una vacante para mostrar
 * en /compartir/[token]. Acceso anónimo (no requiere sesión).
 *
 * Si el token no existe, está revocado o expiró → 404.
 *
 * Por seguridad:
 *   - Correos y teléfonos se enmascaran (maskEmail/maskPhone).
 *   - Solo se devuelven candidatos con `visible_cliente = true`.
 *   - No se incluyen campos financieros (cobro_cliente, comision_freelance).
 */
export async function GET(request, { params }) {
  try {
    const { token } = params;

    if (!token || token.length < 8) {
      return NextResponse.json({ ok: false, error: 'Token inválido.' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────
    //  MODO DEMO: si el token coincide con el demo-token,
    //  devolvemos data mock para poder previsualizar la UI
    //  sin tener Supabase poblado.
    // ─────────────────────────────────────────────────────────
    if (token === SHARE_DEMO_TOKEN || token.startsWith('demo-')) {
      const demo = getDemoShareData(token);
      if (!demo) {
        return NextResponse.json(
          { ok: false, error: 'Enlace demo no encontrado.' },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, demo: true, ...demo });
    }

    const supabase = createAdminClient();

    // 1) Buscar el share_link y validar vigencia.
    const { data: link, error: linkErr } = await supabase
      .from('share_links')
      .select('id, vacante_id, expires_at, revoked_at, access_count')
      .eq('token', token)
      .maybeSingle();

    if (linkErr || !link) {
      return NextResponse.json(
        { ok: false, error: 'Enlace no encontrado.' },
        { status: 404 },
      );
    }
    if (link.revoked_at) {
      return NextResponse.json(
        { ok: false, error: 'Este enlace fue revocado.' },
        { status: 410 },
      );
    }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json(
        { ok: false, error: 'Este enlace ha expirado.' },
        { status: 410 },
      );
    }

    // 2) Cargar vacante (vista pública — sin campos financieros).
    const { data: vacante, error: vErr } = await supabase
      .from('vacantes_public_view')
      .select('id, titulo_puesto, tipo_jornada, detalle_turno, modalidad, ubicacion, sueldo_candidato, estatus')
      .eq('id', link.vacante_id)
      .single();

    if (vErr || !vacante) {
      return NextResponse.json(
        { ok: false, error: 'La vacante ya no está disponible.' },
        { status: 404 },
      );
    }

    // 3) Cargar candidatos finalistas visibles.
    const { data: vacanteCands, error: vcErr } = await supabase
      .from('vacante_candidatos')
      .select(`
        id,
        estatus,
        puntuacion,
        candidato:candidatos (
          id,
          nombre_completo,
          edad,
          escolaridad,
          correo,
          telefono,
          url_cv_pdf
        )
      `)
      .eq('vacante_id', link.vacante_id)
      .eq('visible_cliente', true)
      .order('puntuacion', { ascending: false });

    if (vcErr) {
      console.error('[api/share] vc error:', vcErr);
      return NextResponse.json(
        { ok: false, error: 'Error cargando candidatos.' },
        { status: 500 },
      );
    }

    const candidatos = (vacanteCands || [])
      .filter((vc) => vc.candidato)
      .map((vc) => {
        const c = vc.candidato;
        return {
          id: c.id,
          nombre_completo: c.nombre_completo,
          edad: c.edad,
          escolaridad: c.escolaridad,
          correo_mask: maskEmail(c.correo),
          telefono_mask: maskPhone(c.telefono),
          url_cv_pdf: c.url_cv_pdf,
          iniciales: c.nombre_completo
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
          estatus: vc.estatus,
          puntuacion: vc.puntuacion,
        };
      });

    // 4) Actualizar métricas de acceso (best-effort).
    supabase
      .from('share_links')
      .update({
        access_count: (link.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', link.id)
      .then(() => {}, () => {});

    return NextResponse.json({
      ok: true,
      demo: false,
      vacante,
      candidatos,
      expires_at: link.expires_at,
      access_count: (link.access_count || 0) + 1,
    });
  } catch (err) {
    console.error('[api/share] unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}