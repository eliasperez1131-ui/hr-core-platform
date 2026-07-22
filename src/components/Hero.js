export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-30" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              Plataforma B2B · Evaluación psicométrica + ATS
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Contrata al talento correcto con{' '}
              <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 bg-clip-text text-transparent">
                ciencia, no con corazonadas
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl">
              7 pruebas psicométricas validadas, pipeline Kanban y un CRM de talento diseñado para
              agencias de reclutamiento y empresas con alto volumen de contratación.
              Reduce rotación hasta un <strong className="text-white">38%</strong> y acelera tus cierres.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contacto"
                className="inline-flex items-center rounded-md bg-brand-500 hover:bg-brand-600 px-6 py-3 text-white font-semibold transition shadow-glow"
              >
                Solicitar demo gratuita →
              </a>
              <a
                href="#pruebas"
                className="inline-flex items-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-white font-semibold transition"
              >
                Ver catálogo de pruebas
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="uppercase tracking-wider text-slate-500">Demo interna:</span>
              <a href="/acceso-evaluacion"     className="hover:text-brand-300 transition">/acceso-evaluacion</a>
              <span className="text-slate-600">·</span>
              <a href="/dashboard-saas"        className="hover:text-brand-300 transition">/dashboard-saas</a>
              <span className="text-slate-600">·</span>
              <a href="/dashboard-freelance"   className="hover:text-brand-300 transition">/dashboard-freelance</a>
              <span className="text-slate-600">·</span>
              <a href="/candidato/demo1"       className="hover:text-brand-300 transition">/candidato/demo1</a>
              <span className="text-slate-600">·</span>
              <a href="/resultados/demo"       className="hover:text-brand-300 transition">/resultados/demo</a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <dt className="text-sm text-slate-400">Pruebas validadas</dt>
                <dd className="mt-1 text-2xl font-bold text-white">7</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Tiempo promedio</dt>
                <dd className="mt-1 text-2xl font-bold text-white">24 min</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Confiabilidad global</dt>
                <dd className="mt-1 text-2xl font-bold text-white">91%</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400">Live preview</span>
                <span className="text-xs text-emerald-400">● En vivo</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Ana Reyes',     rol: 'Guardia de seguridad', score: 92, status: 'Top Match' },
                  { name: 'Carlos Méndez', rol: 'Auxiliar logístico',   score: 87, status: 'Apto' },
                  { name: 'Lucía Torres',  rol: 'Ejecutiva de ventas',  score: 78, status: 'Revisar' },
                  { name: 'Miguel Núñez',  rol: 'Jefe de turno',        score: 95, status: 'Top Match' },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 border border-white/5"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.rol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-400 font-bold">{c.score}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{c.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-brand-500/10 border border-brand-500/30 p-3 text-xs text-brand-200">
                🔒 La información financiera (cobro_cliente / comisión) permanece oculta
                para Reclutadores Freelance y Clientes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}