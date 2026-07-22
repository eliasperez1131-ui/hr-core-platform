export default function Footer() {
  return (
    <footer className="bg-ink-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
                HR
              </div>
              <span className="text-white font-semibold tracking-tight text-lg">
                HR<span className="text-brand-400">CORE</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400 max-w-md">
              Plataforma SaaS B2B de evaluaciones psicométricas + ATS, diseñada para agencias
              de reclutamiento y departamentos de RR.HH. con alto volumen.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold">Producto</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#pruebas" className="hover:text-white">Catálogo de pruebas</a></li>
              <li><a href="#planes" className="hover:text-white">Planes</a></li>
              <li><a href="/contacto" className="hover:text-white">Solicitar demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold">Empresa</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/contacto" className="hover:text-white">Contacto</a></li>
              <li><a href="#" className="hover:text-white">Privacidad</a></li>
              <li><a href="#" className="hover:text-white">Términos</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HR CORE. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-500">Hecho con Next.js + Supabase + Tailwind</p>
        </div>
      </div>
    </footer>
  );
}