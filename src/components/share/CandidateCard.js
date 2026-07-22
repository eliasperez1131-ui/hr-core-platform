import PaywallOverlay from '@/components/portal-cliente/PaywallOverlay';

/**
 * CandidateCard — Tarjeta del candidato en el Magic Link público.
 *
 * Si `bloqueada = true`, oculta el botón de descarga del CV con un
 * overlay de candado (el paywall). Los datos sensibles (correo,
 * teléfono) ya están enmascarados en el page.js de /compartir.
 *
 * Props:
 *   candidato   -> { nombre_completo, edad, escolaridad, iniciales, url_cv_pdf, ... }
 *   bloqueada   -> boolean (default false). Si true, oculta botón CV.
 *   factura     -> objeto factura (para mostrar el id en el overlay)
 */
export default function CandidateCard({ candidato, bloqueada = false, factura = null }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-glow hover:border-brand-300 transition group">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 flex-none rounded-full bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-white text-base font-bold shadow-lg">
          {candidato.iniciales || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-ink-900 truncate">
            {candidato.nombre_completo}
          </h4>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {candidato.edad ? `${candidato.edad} años` : 'Edad no especificada'}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
              {candidato.escolaridad || 'Escolaridad no especificada'}
            </span>
          </div>
        </div>
        {typeof candidato.puntuacion === 'number' && (
          <div className="text-right flex-none">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Match</p>
            <p className="text-2xl font-extrabold text-brand-600">{candidato.puntuacion}</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100">
        {/* CV: con paywall si está bloqueado */}
        {bloqueada ? (
          <PaywallOverlay bloqueada={true} factura={factura} mode="hide">
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-sm font-medium px-4 py-2.5 cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CV disponible previa entrevista
            </button>
          </PaywallOverlay>
        ) : candidato.url_cv_pdf ? (
          <a
            href={candidato.url_cv_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-4 py-2.5 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar CV (PDF)
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-sm font-medium px-4 py-2.5 cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CV disponible previa entrevista
          </button>
        )}
      </div>
    </article>
  );
}