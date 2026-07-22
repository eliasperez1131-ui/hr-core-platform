'use client';

/**
 * CVOriginal — Tab 3
 * Preview del CV original del candidato (si tiene URL) o placeholder.
 */
export default function CVOriginal({ candidato }) {
  if (!candidato?.url_cv_pdf) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-200 grid place-items-center text-slate-400 mb-3">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-ink-900">CV no disponible</h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
          El candidato no subió un CV en PDF. Se utilizó solo la información de su postulación
          para la evaluación psicométrica.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-900">CV Original del Candidato</h3>
        <a
          href={candidato.url_cv_pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold px-3 py-1.5 transition no-print"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar CV
        </a>
      </header>
      <div className="bg-slate-100 p-4">
        <iframe
          src={candidato.url_cv_pdf}
          className="w-full h-[800px] rounded-lg border border-slate-200 bg-white"
          title="CV del candidato"
        />
      </div>
    </div>
  );
}