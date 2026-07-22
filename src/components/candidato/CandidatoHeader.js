'use client';

import PrintButton from './PrintButton';
import { getIniciales } from '@/lib/candidato-data';

/**
 * CandidatoHeader — Encabezado del candidato con:
 *   - Avatar (placeholder con iniciales) o foto
 *   - Nombre completo + Edad + Escolaridad + Ubicación
 *   - Puesto al que aplicó + empresa
 *   - Botón de acción principal "Descargar Reporte en PDF"
 *
 * Props:
 *   candidato        -> objeto candidato
 *   vacante         -> objeto vacante
 *   printRef        -> ref del contenido imprimible
 *   readOnly         -> true en vista Magic Link (oculta botones de edición)
 */
export default function CandidatoHeader({ candidato, vacante, printRef, readOnly = false }) {
  const iniciales = getIniciales(candidato?.nombre_completo);

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white shadow-lg print:bg-white print:text-ink-900 print:shadow-none">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-15 print:hidden" />
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl print:hidden" />

      <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* Avatar */}
        <div className="flex-none">
          {candidato?.url_cv_pdf ? (
            <img
              src={candidato.url_cv_pdf}
              alt={candidato.nombre_completo}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
            />
          ) : (
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-brand-400 via-accent-400 to-pink-400 grid place-items-center text-white text-3xl font-extrabold ring-4 ring-white/20 shadow-2xl">
              {iniciales}
            </div>
          )}
        </div>

        {/* Datos */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-brand-300 font-semibold">
            {vacante?.empresa || 'HR CORE'}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {candidato?.nombre_completo || 'Candidato sin nombre'}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
            {candidato?.edad && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {candidato.edad} años
              </span>
            )}
            {candidato?.escolaridad && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
                {candidato.escolaridad}
              </span>
            )}
            {(candidato?.estado || candidato?.municipio) && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[candidato?.municipio, candidato?.estado].filter(Boolean).join(', ')}
              </span>
            )}
            {candidato?.telefono && !readOnly && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {candidato.telefono}
              </span>
            )}
          </div>

          {/* Puesto */}
          {vacante && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-3 py-2 ring-1 ring-white/20">
              <span className="text-[10px] uppercase tracking-wider text-brand-300 font-bold">Aplicó a:</span>
              <span className="text-sm font-bold">{vacante.titulo}</span>
              <span className="text-xs text-slate-300">
                · {vacante.tipo_jornada} {vacante.detalle_turno && `· ${vacante.detalle_turno}`} · {vacante.modalidad}
              </span>
            </div>
          )}
        </div>

        {/* Botón PDF */}
        {!readOnly && printRef && (
          <div className="flex-none no-print">
            <PrintButton
              targetRef={printRef}
              fileName={`reporte-${candidato?.nombre_completo?.replace(/\s+/g, '-').toLowerCase() || 'candidato'}.pdf`}
            />
          </div>
        )}

        {/* Indicador de modo solo lectura (Magic Link) */}
        {readOnly && (
          <div className="flex-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30 no-print">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Vista protegida · solo lectura
            </span>
          </div>
        )}
      </div>
    </header>
  );
}