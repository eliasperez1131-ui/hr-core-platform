'use client';

import { useState } from 'react';
import SemaforoBadge   from '@/components/candidato/SemaforoBadge';
import PaywallOverlay, { PaywallBanner } from './PaywallOverlay';
import {
  DEMO_CANDIDATOS_VIP,
  esVacanteBloqueada,
} from '@/lib/facturas-data';

/**
 * TalentoVipTab — Tab 2: Headhunting.
 *
 * Lista los candidatos VIP trabajados internamente por el equipo de HR CORE.
 * Aplica el paywall:
 *   - Si la vacante del candidato tiene factura Pendiente/En_Revision:
 *     · Banner grande arriba
 *     · Blur en teléfono, correo y CV
 *   - Si está Pagada o sin factura:
 *     · Muestra todo normal
 */
export default function TalentoVipTab({ onPagarFactura }) {
  const [seleccion, setSeleccion] = useState(null);

  // Calcula el paywall para cada candidato
  const candidatos = DEMO_CANDIDATOS_VIP.map((c) => ({
    ...c,
    // Asignamos un vacante_id demo según la primera factura pendiente
    vacante_id: 'v3', // viene de la factura Pendiente
  }));

  const hayAlgunaDeuda = candidatos.some((c) => esVacanteBloqueada(c.vacante_id).bloqueada);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-900">Talento VIP</h2>
          <p className="text-sm text-slate-600 mt-1">
            Candidatos pre-seleccionados y aprobados por nuestro equipo de headhunting.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
          ⭐ {candidatos.length} candidatos disponibles
        </span>
      </div>

      {/* Banner global si hay alguna deuda */}
      {hayAlgunaDeuda && (
        <PaywallBanner bloqueada={true} factura={null} onPagar={onPagarFactura} />
      )}

      {/* Grid de candidatos */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {candidatos.map((c) => {
          const { bloqueada, factura } = esVacanteBloqueada(c.vacante_id);
          return (
            <article
              key={c.id}
              className={[
                'rounded-2xl border bg-white p-6 shadow-sm transition',
                bloqueada ? 'border-rose-200' : 'border-slate-200 hover:shadow-glow hover:border-brand-300',
              ].join(' ')}
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className={[
                  'h-14 w-14 flex-none rounded-full grid place-items-center text-white text-base font-bold shadow-lg',
                  bloqueada
                    ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                    : 'bg-gradient-to-br from-brand-500 to-accent-500',
                ].join(' ')}>
                  {bloqueada ? '🔒' : c.inicial}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-ink-900 truncate">{c.nombre_completo}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.escolaridad} · {c.edad} años</p>
                  <p className="text-xs text-slate-500">{c.estado}, {c.municipio}</p>
                </div>
                <SemaforoBadge baremo={c.baremo} showPercent={false} />
              </div>

              {/* Resultados */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniScore label="Integridad" value={c.integridad_pct} />
                <MiniScore label="Cognitivo"  value={c.cognitivo_pct} />
              </div>

              {/* Eje DISC */}
              <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-500">Perfil dominante:</span>{' '}
                <strong className="text-ink-900">{c.eje_disc}</strong>
              </div>

              {/* Datos sensibles con paywall */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <PaywallOverlay bloqueada={bloqueada} factura={factura}>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-mono">{c.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{c.correo}</span>
                  </div>
                </PaywallOverlay>

                {/* Botón CV: hidden si hay deuda */}
                <PaywallOverlay bloqueada={bloqueada} mode="hide" factura={factura}>
                  <button
                    type="button"
                    className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-3 py-2 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar CV (PDF)
                  </button>
                </PaywallOverlay>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MiniScore({ label, value }) {
  const tone = value >= 75 ? 'emerald' : value >= 65 ? 'sky' : 'amber';
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    sky:     'bg-sky-50 text-sky-700 ring-sky-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
  };
  return (
    <div className={`rounded-md ring-1 px-2.5 py-1.5 text-center ${tones[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold">{label}</p>
      <p className="text-lg font-extrabold tabular-nums">{value}%</p>
    </div>
  );
}