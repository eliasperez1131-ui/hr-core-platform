'use client';

import Link from 'next/link';

/**
 * PortalLayout — Sidebar corporativo para el Portal Cliente HR CORE.
 *
 * Tabs:
 *   1. tus-evaluaciones  → Tus Evaluaciones (SaaS)
 *   2. talento-vip       → Talento VIP (Headhunting)
 *   3. facturacion       → Facturación Global
 *
 * Props:
 *   active    -> 'tus-evaluaciones' | 'talento-vip' | 'facturacion'
 *   onChange  -> (tab) => void
 *   children  -> contenido del tab activo
 *   cliente   -> { nombre, empresa, plan, creditos_disponibles }
 */
const TABS = [
  {
    key: 'tus-evaluaciones',
    label: 'Tus Evaluaciones',
    sub: 'SaaS',
    icon: 'evaluaciones',
  },
  {
    key: 'talento-vip',
    label: 'Talento VIP',
    sub: 'Headhunting',
    icon: 'vip',
  },
  {
    key: 'facturacion',
    label: 'Facturación Global',
    sub: 'Pagos',
    icon: 'facturacion',
  },
];

export default function PortalLayout({ active, onChange, children, cliente }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-ink-900 text-white flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black">
            HR
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">HR<span className="text-brand-400">CORE</span></p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">
              Portal Cliente
            </p>
          </div>
        </div>

        {/* Cliente info */}
        {cliente && (
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-xs text-slate-400">Empresa</p>
            <p className="text-sm font-bold truncate">{cliente.empresa || '—'}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-500/20 px-1.5 py-0.5 text-brand-300 font-bold">
                {cliente.plan || 'Professional'}
              </span>
              {typeof cliente.creditos_disponibles === 'number' && (
                <span className="text-slate-400">
                  {cliente.creditos_disponibles} créditos
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onChange?.(t.key)}
                className={[
                  'w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left transition',
                  isActive
                    ? 'bg-white/10 ring-1 ring-white/15'
                    : 'hover:bg-white/5',
                ].join(' ')}
              >
                <TabIcon name={t.icon} active={isActive} />
                <div className="flex-1 min-w-0">
                  <p className={[
                    'text-sm font-semibold',
                    isActive ? 'text-white' : 'text-slate-200',
                  ].join(' ')}>
                    {t.label}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{t.sub}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-white/10 text-[10px] text-slate-500">
          <p className="px-3 mb-2">Portal Cliente HR CORE v1.0</p>
          <Link href="/dashboard-saas" className="block px-3 py-2 rounded-md hover:bg-white/5 text-slate-300">
            ← Volver al dashboard clásico
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

function TabIcon({ name, active }) {
  const paths = {
    evaluaciones: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    vip: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    facturacion: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  };
  return (
    <svg
      className={`h-5 w-5 flex-none mt-0.5 ${active ? 'text-brand-400' : 'text-slate-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.evaluaciones} />
    </svg>
  );
}