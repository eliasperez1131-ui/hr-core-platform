import { PLANES } from '@/lib/data';

export default function Plans() {
  return (
    <section id="planes" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-brand-600 uppercase tracking-wider">
            Planes y Precios
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Elige el plan que crece con tu agencia
          </p>
          <p className="mt-4 text-lg text-slate-600">
            Sin contratos forzosos. Todos los planes incluyen 14 días de prueba gratuita con acceso
            completo al catálogo de pruebas.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {PLANES.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative rounded-2xl p-8 transition',
                plan.destacado
                  ? 'bg-ink-900 text-white shadow-glow ring-2 ring-brand-500 scale-[1.02]'
                  : 'bg-white text-ink-900 border border-slate-200 hover:border-brand-300',
              ].join(' ')}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-3 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}

              <h3 className={`text-xl font-bold ${plan.destacado ? 'text-white' : 'text-ink-900'}`}>
                {plan.nombre}
              </h3>
              <p className={`mt-2 text-sm ${plan.destacado ? 'text-slate-300' : 'text-slate-600'}`}>
                {plan.descripcion}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold ${plan.destacado ? 'text-white' : 'text-ink-900'}`}>
                  {plan.precio}
                </span>
                <span className={plan.destacado ? 'text-slate-400' : 'text-slate-500'}>
                  {plan.periodicidad}
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-none ${
                        plan.destacado ? 'text-brand-400' : 'text-brand-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.destacado ? 'text-slate-200' : 'text-slate-700'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/contacto"
                className={[
                  'mt-8 block text-center rounded-md px-4 py-3 text-sm font-semibold transition',
                  plan.destacado
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-ink-900 hover:bg-ink-800 text-white',
                ].join(' ')}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          ¿Necesitas un plan a medida? <a href="/contacto" className="text-brand-600 hover:underline">Hablemos</a>.
        </p>
      </div>
    </section>
  );
}