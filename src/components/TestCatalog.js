import { PRUEBAS_CATALOGO } from '@/lib/data';

const ICONOS = {
  'shield-check': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'cpu':          'M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7z',
  'brain':        'M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V14a2 2 0 11-4 0v-4.5C8.8 8.8 8 7.5 8 6a4 4 0 014-4zm-4 8a2 2 0 100 4h2v-4H8zm6 0v4h2a2 2 0 100-4h-2z',
  'rocket':       'M5 13l4-4 4 4-4 4-4-4zm14-9l-3 3m0 0l-3 3m3-3l3 3m-3-3l-3-3',
  'crown':        'M3 17h18M3 13l3-6 6 4 6-4 3 6M5 21h14',
  'trending-up':  'M3 17l6-6 4 4 8-8M14 7h7v7',
  'headphones':   'M3 18v-6a9 9 0 1118 0v6M3 18a2 2 0 002 2h1v-7H5a2 2 0 00-2 2v3zm18 0a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2v3z',
};

export default function TestCatalog() {
  return (
    <section id="pruebas" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header compacto */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-base font-semibold text-brand-600 uppercase tracking-wider">
            Catálogo de Pruebas
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            7 bloques psicométricos validados
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Calibrados para B2B. Resultados en menos de 30&nbsp;min, con scoring automático y reporte descargable.
          </p>
        </div>

        {/* Grid compacto de las 7 + CTA */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRUEBAS_CATALOGO.map((prueba) => (
            <article
              key={prueba.codigo}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-md hover:border-brand-300"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-none h-10 w-10 rounded-lg bg-gradient-to-br ${prueba.color} grid place-items-center text-white shadow`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONOS[prueba.icono]} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {prueba.categoria}
                  </p>
                  <h3 className="text-sm font-bold text-ink-900 truncate">{prueba.nombre}</h3>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {prueba.descripcion}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prueba.metricas.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </article>
          ))}

          {/* Card CTA compacta */}
          <article className="rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 p-4 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold">¿Necesitas una prueba a medida?</h3>
              <p className="mt-2 text-xs text-brand-100">
                Baterías personalizadas por industria: seguridad, retail, salud, etc.
              </p>
            </div>
            <a
              href="/contacto"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-white text-brand-700 px-3 py-1.5 text-xs font-semibold hover:bg-brand-50 transition"
            >
              Hablar con un experto
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}