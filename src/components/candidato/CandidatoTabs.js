'use client';

import { useState } from 'react';

/**
 * CandidatoTabs — Contenedor con pestañas:
 *   1. Resumen Ejecutivo
 *   2. Análisis Psicométrico
 *   3. CV Original
 */
export default function CandidatoTabs({ resumen, analisis, cv }) {
  const [tab, setTab] = useState('resumen');

  const tabs = [
    { key: 'resumen',  label: 'Resumen Ejecutivo',     icon: 'document' },
    { key: 'analisis', label: 'Análisis Psicométrico', icon: 'chart' },
    { key: 'cv',       label: 'CV Original',           icon: 'file' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 no-print">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={[
                'inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap',
                tab === t.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              <TabIcon name={t.icon} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {tab === 'resumen'  && resumen}
        {tab === 'analisis' && analisis}
        {tab === 'cv'       && cv}
      </div>

      {/* Para impresión: imprimir TODO, no solo la tab activa */}
      <div className="hidden print:block space-y-6">
        <section><h3 className="text-base font-bold text-ink-900 mb-3">Resumen Ejecutivo</h3>{resumen}</section>
        <section className="print-break"><h3 className="text-base font-bold text-ink-900 mb-3">Análisis Psicométrico</h3>{analisis}</section>
        <section className="print-break"><h3 className="text-base font-bold text-ink-900 mb-3">CV Original</h3>{cv}</section>
      </div>
    </div>
  );
}

function TabIcon({ name }) {
  const paths = {
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    file:     'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  };
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.document} />
    </svg>
  );
}