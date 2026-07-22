import Link from 'next/link';

const NAV_POR_ROL = {
  Cliente_SaaS: [
    { href: '/dashboard-saas',      label: 'Inicio',          icon: 'home' },
    { href: '/crear-vacante',       label: 'Nueva vacante',   icon: 'plus' },
    { href: '#vacantes',            label: 'Mis vacantes',    icon: 'briefcase' },
    { href: '#candidatos',          label: 'Candidatos',      icon: 'users' },
    { href: '#reportes',            label: 'Reportes',        icon: 'chart' },
    { href: '#cuenta',              label: 'Cuenta y plan',   icon: 'cog' },
  ],
  Reclutador_Freelance: [
    { href: '/dashboard-freelance', label: 'Inicio',          icon: 'home' },
    { href: '#pipeline',            label: 'Mi pipeline',     icon: 'kanban' },
    { href: '#historial',           label: 'Historial',       icon: 'clock' },
    { href: '#pagos',               label: 'Pagos',           icon: 'cash' },
    { href: '#perfil',              label: 'Mi perfil',       icon: 'user' },
  ],
  Administrador_Agencia: [
    { href: '/dashboard-saas',      label: 'Inicio',          icon: 'home' },
    { href: '/crear-vacante',       label: 'Nueva vacante',   icon: 'plus' },
    { href: '#workspaces',          label: 'Workspaces',      icon: 'building' },
    { href: '#coordinadores',       label: 'Coordinadores',   icon: 'users' },
    { href: '#freelancers',         label: 'Freelancers',     icon: 'star' },
    { href: '#finanzas',            label: 'Finanzas',        icon: 'cash' },
  ],
  Super_Admin: [
    { href: '/dashboard-saas',      label: 'Inicio',          icon: 'home' },
    { href: '/crear-vacante',       label: 'Nueva vacante',   icon: 'plus' },
    { href: '#workspaces',          label: 'Workspaces',      icon: 'building' },
    { href: '#usuarios',            label: 'Usuarios',        icon: 'users' },
    { href: '#prospectos',          label: 'Prospectos',      icon: 'inbox' },
    { href: '#config',              label: 'Config global',   icon: 'shield' },
  ],
};

const ICONOS = {
  home:      <path d="M3 12l9-9 9 9M5 10v10h14V10" />,
  plus:      <path d="M12 5v14M5 12h14" />,
  briefcase: <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />,
  users:     <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM3 21v-1a6 6 0 0112 0v1M21 21v-1a4 4 0 00-3-3.87" />,
  chart:     <path d="M3 21h18M6 17V9m6 8V5m6 12v-6" />,
  cog:       <path d="M12 15a3 3 0 100-6 3 3 0 000 6zm9-3a9 9 0 01-.2 1.9l2.1 1.6-2 3.4-2.5-1a9 9 0 01-3.3 1.9L14.5 22h-4l-.6-2.1a9 9 0 01-3.3-1.9l-2.5 1-2-3.4 2.1-1.6A9 9 0 014 12a9 9 0 01.2-1.9L2.1 8.5l2-3.4 2.5 1A9 9 0 0110 4.2L10.5 2h4l.6 2.1a9 9 0 013.3 1.9l2.5-1 2 3.4-2.1 1.6c.1.6.2 1.3.2 1.9z" />,
  kanban:    <path d="M3 5h4v14H3zM10 5h4v9h-4zM17 5h4v12h-4z" />,
  clock:     <path d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  cash:      <path d="M3 7h18v10H3zM7 12h2m4 0h6" />,
  user:      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 0116 0v1" />,
  building:  <path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h2m-2 4h2m2-4h2m-2 4h2" />,
  star:      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />,
  inbox:     <path d="M3 13l3-9h12l3 9v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13h6l1 2h4l1-2h6" />,
  shield:    <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6z" />,
};

export default function Sidebar({ rol = 'Cliente_SaaS', active }) {
  const items = NAV_POR_ROL[rol] || NAV_POR_ROL.Cliente_SaaS;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
          HR
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900 leading-tight">
            HR<span className="text-brand-600">CORE</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {rol.replaceAll('_', ' ')}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              <svg
                className={[
                  'h-4 w-4 flex-none',
                  isActive ? 'text-brand-600' : 'text-slate-500',
                ].join(' ')}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                {ICONOS[item.icon]}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg bg-ink-900 p-4 text-white">
        <p className="text-xs uppercase tracking-wider text-brand-400">Soporte 24/5</p>
        <p className="mt-1 text-sm font-semibold">¿Necesitas ayuda?</p>
        <a
          href="/contacto"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-medium transition"
        >
          Contactar ejecutivo
        </a>
      </div>
    </aside>
  );
}