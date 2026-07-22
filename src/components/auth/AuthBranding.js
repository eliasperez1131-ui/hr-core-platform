import Link from 'next/link';

/**
 * Branding lateral para pantallas de auth.
 * Split-screen con fondo gradiente y mensaje motivacional.
 */
export default function AuthBranding() {
  return (
    <div className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-to-br from-ink-900 via-brand-900 to-accent-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-20" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-500/30 blur-3xl" />

      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-white/15 backdrop-blur grid place-items-center font-black text-white">
            HR
          </div>
          <span className="text-xl font-bold tracking-tight">
            HR<span className="text-brand-400">CORE</span>
          </span>
        </Link>
      </div>

      <div className="relative space-y-6 max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Plataforma líder en LATAM
        </span>
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
          Contrata al talento correcto con{' '}
          <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
            ciencia, no con corazonadas
          </span>
        </h2>
        <p className="text-lg text-brand-100">
          7 pruebas psicométricas validadas + ATS pipeline Kanban.
          Únete a las agencias que ya redujeron su rotación hasta un 38%.
        </p>

        <ul className="space-y-3 pt-4">
          {[
            'Resultados en menos de 30 minutos',
            'Privacidad financiera por RLS',
            'Roles especializados por industria',
            'Soporte 24/5 en español',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-brand-100">
              <span className="grid place-items-center h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 flex-none">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative pt-8 border-t border-white/10">
        <blockquote className="text-sm italic text-brand-100">
          "HR CORE transformó nuestra agencia. Pasamos de 12 cierres/mes a 34 sin sacrificar calidad."
        </blockquote>
        <p className="mt-2 text-xs text-brand-300">
          — María José Hernández · Grupo RH del Norte
        </p>
      </div>
    </div>
  );
}