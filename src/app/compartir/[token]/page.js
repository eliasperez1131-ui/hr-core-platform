import { notFound } from 'next/navigation';
import CandidateCard         from '@/components/share/CandidateCard';
import { PaywallBanner }      from '@/components/portal-cliente/PaywallOverlay';
import { getDemoShareData, SHARE_DEMO_TOKEN } from '@/lib/share-mock';
import { formatDateShort } from '@/lib/format';
import { esVacanteBloqueada } from '@/lib/facturas-data';

/**
 * Página PÚBLICA /compartir/[token_magico]
 *
 * Server Component — no requiere sesión.
 * Renderiza los finalistas visibles de una vacante.
 *
 * En desarrollo, si el token empieza con "demo-" se sirve
 * data mock para poder previsualizar la UI sin Supabase.
 */
export async function generateMetadata({ params }) {
  return {
    title: 'Finalistas de la vacante · HR CORE',
    description: 'Portal seguro de visualización de candidatos finalistas.',
    robots: { index: false, follow: false }, // No indexar
  };
}

async function fetchShareData(token) {
  // Modo demo (sin backend)
  if (token.startsWith('demo-')) {
    return getDemoShareData(token);
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/share/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.ok ? json : null;
  } catch {
    return null;
  }
}

export default async function CompartirPage({ params }) {
  const { token: token_magico } = params;

  if (!token_magico || token_magico.length < 8) {
    notFound();
  }

  const data = await fetchShareData(token_magico);

  if (!data) {
    notFound();
  }

  const { vacante, candidatos = [], expires_at, access_count, demo } = data;

  // PAYWALL: verificamos si la vacante tiene deuda activa
  const { bloqueada, factura } = vacante?.id
    ? esVacanteBloqueada(vacante.id)
    : { bloqueada: false, factura: null };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar minimalista */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
              HR
            </div>
            <span className="text-lg font-bold text-ink-900">
              {vacante.empresa || 'HR CORE'}
            </span>
          </div>
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Acceso seguro · enlace cifrado
          </span>
        </div>
      </header>

      {/* Hero con la vacante */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-brand-900 to-accent-600 text-white">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-20" />
        <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium">
            Portal de finalistas
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {vacante.titulo_puesto}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {vacante.ubicacion && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {vacante.ubicacion}
              </span>
            )}
            {vacante.modalidad && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                {vacante.modalidad}
              </span>
            )}
            {vacante.tipo_jornada && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                {vacante.tipo_jornada}{vacante.detalle_turno ? ` · ${vacante.detalle_turno}` : ''}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Lista de finalistas */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">
              {candidatos.length} {candidatos.length === 1 ? 'finalista' : 'finalistas'} preseleccionados
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Perfiles evaluados y aprobados por el equipo de reclutamiento.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacidad protegida
          </span>
        </div>

        {/* Banner de paywall si hay deuda */}
        {bloqueada && (
          <div className="mb-6">
            <PaywallBanner bloqueada={true} factura={factura} />
          </div>
        )}

        {candidatos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">
              Aún no hay finalistas visibles en este portal.
              <br />El reclutador los marcará cuando estén listos para tu revisión.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidatos.map((c) => (
              <CandidateCard key={c.id} candidato={c} bloqueada={bloqueada} factura={factura} />
            ))}
          </div>
        )}

        {/* Footer informativo */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              {demo
                ? '🧪 Modo demostración — datos no reales.'
                : `Enlace cifrado · ${access_count != null ? `${access_count} ${access_count === 1 ? 'acceso' : 'accesos'} registrados` : ''}${expires_at ? ` · expira el ${formatDateShort(expires_at)}` : ''}`}
            </p>
            <p className="text-slate-400">
              Desarrollado por <span className="font-semibold text-ink-900">HR CORE</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}