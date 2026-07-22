// Forzar render server-side (no prerender) por uso de cookies/request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase-admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+\-()]{10,20}$/;

export async function POST(request) {
  try {
    const body = await request.json();

    const nombre_empresa     = String(body.nombre_empresa     ?? '').trim();
    const nombre_contacto    = String(body.nombre_contacto    ?? '').trim();
    const correo_corporativo = String(body.correo_corporativo ?? '').trim().toLowerCase();
    const telefono           = String(body.telefono           ?? '').trim();
    const interes            = String(body.interes            ?? 'Ambos');
    const mensaje            = String(body.mensaje            ?? '').trim();

    if (!nombre_empresa || nombre_empresa.length < 2) {
      return NextResponse.json({ ok: false, error: 'El nombre de la empresa es obligatorio.' }, { status: 400 });
    }
    if (!nombre_contacto || nombre_contacto.length < 2) {
      return NextResponse.json({ ok: false, error: 'El nombre del contacto es obligatorio.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(correo_corporativo)) {
      return NextResponse.json({ ok: false, error: 'El correo corporativo no es válido.' }, { status: 400 });
    }
    if (!PHONE_RE.test(telefono)) {
      return NextResponse.json({ ok: false, error: 'El teléfono debe tener entre 10 y 20 dígitos.' }, { status: 400 });
    }
    if (!['SaaS', 'Freelance', 'Ambos'].includes(interes)) {
      return NextResponse.json({ ok: false, error: 'El interés seleccionado no es válido.' }, { status: 400 });
    }

    const hdrs = headers();
    const ip_origen  = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const user_agent = hdrs.get('user-agent') ?? null;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('prospectos_pendientes')
      .insert({
        nombre_empresa,
        nombre_contacto,
        correo_corporativo,
        telefono,
        interes,
        mensaje: mensaje.slice(0, 1000),
        ip_origen,
        user_agent,
        utm_source:   hdrs.get('x-utm-source')   ?? null,
        utm_campaign: hdrs.get('x-utm-campaign') ?? null,
        estatus: 'Nuevo',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[api/prospectos] insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'No pudimos registrar tu solicitud. Intenta de nuevo en un momento.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('[api/prospectos] unexpected:', err);
    return NextResponse.json(
      { ok: false, error: 'Error inesperado. Por favor contacta a soporte.' },
      { status: 500 },
    );
  }
}