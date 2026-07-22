// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { generateShareToken, DEFAULT_EXPIRY_DAYS, buildShareUrl } from '@/lib/share-helpers';

/**
 * POST /api/vacantes/[id]/share-link
 *
 * Genera un nuevo Magic Link para que el Admin/Reclutador
 * pueda compartir los finalistas de una vacante con un
 * cliente externo sin necesidad de cuenta.
 *
 * Body (opcional):
 *   { label?: string, dias_expiracion?: number }
 *
 * Permisos: Super_Admin, Administrador_Agencia, Coordinador
 *           (validado vía RLS al hacer el INSERT).
 */
export async function POST(request, { params }) {
  try {
    const { id: vacante_id } = params;

    if (!vacante_id) {
      return NextResponse.json(
        { ok: false, error: 'Falta el ID de la vacante.' },
        { status: 400 },
      );
    }

    let body = {};
    try { body = await request.json(); } catch { /* vacío */ }

    const label            = String(body.label || 'Enlace para cliente').slice(0, 100);
    const dias_expiracion  = Math.min(
      Math.max(parseInt(body.dias_expiracion || DEFAULT_EXPIRY_DAYS, 10) || DEFAULT_EXPIRY_DAYS, 1),
      90,
    );

    const supabase = createAdminClient();

    // Verificar que la vacante existe (RLS aplica aquí también).
    const { data: vacante, error: vErr } = await supabase
      .from('vacantes')
      .select('id, titulo_puesto, estatus')
      .eq('id', vacante_id)
      .single();

    if (vErr || !vacante) {
      return NextResponse.json(
        { ok: false, error: 'La vacante no existe o no tienes permisos.' },
        { status: 404 },
      );
    }

    const token = generateShareToken();
    const expires_at = new Date(Date.now() + dias_expiracion * 24 * 60 * 60 * 1000).toISOString();

    const { data: link, error: insErr } = await supabase
      .from('share_links')
      .insert({
        token,
        vacante_id,
        label,
        expires_at,
      })
      .select('id, token, vacante_id, label, expires_at, created_at')
      .single();

    if (insErr || !link) {
      console.error('[api/share-link] insert error:', insErr);
      return NextResponse.json(
        { ok: false, error: 'No se pudo crear el enlace mágico.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      link: {
        ...link,
        url: buildShareUrl(token),
      },
    });
  } catch (err) {
    console.error('[api/share-link] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado al generar el enlace.' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/vacantes/[id]/share-link
 *
 * Lista los enlaces mágicos generados para una vacante.
 */
export async function GET(request, { params }) {
  try {
    const { id: vacante_id } = params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('share_links')
      .select('id, token, label, expires_at, access_count, last_accessed_at, revoked_at, created_at')
      .eq('vacante_id', vacante_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'No se pudieron listar los enlaces.' },
        { status: 500 },
      );
    }

    const enriched = (data || []).map((l) => ({
      ...l,
      url: buildShareUrl(l.token),
      expired: l.expires_at ? new Date(l.expires_at) < new Date() : false,
      revoked: !!l.revoked_at,
    }));

    return NextResponse.json({ ok: true, links: enriched });
  } catch (err) {
    console.error('[api/share-link] GET unexpected:', err);
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 });
  }
}