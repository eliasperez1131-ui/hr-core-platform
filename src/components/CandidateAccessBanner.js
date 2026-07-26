/**
 * CandidateAccessBanner — flujo de acceso de candidatos con Tel + Token.
 * Versión compacta: copy + CTA en una sola línea.
 */
export default function CandidateAccessBanner() {
  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
                🔐 Acceso seguro de candidatos
              </span>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900">
                Teléfono + Token único.{' '}
                <span className="text-brand-600">Sin links públicos.</span>
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-xl">
                3 pasos: <strong>registras</strong> al candidato → el sistema genera un{' '}
                <strong>token</strong> de 7 caracteres (alfabeto seguro sin O/0/I/L/1) → el
                candidato entra a{' '}
                <code className="px-1 bg-slate-100 rounded font-mono text-[12px]">
                  /acceso-evaluacion
                </code>
                .
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              <a
                href="/acceso-evaluacion"
                className="inline-flex items-center rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-4 py-2.5 transition"
              >
                Probar acceso de candidato →
              </a>
              <a
                href="/registrar-candidato"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2.5 transition"
              >
                Registrar candidato (demo)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}