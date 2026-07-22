export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-900/80 border-b border-white/5">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
            HR
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">
            HR<span className="text-brand-400">CORE</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#pruebas"  className="hover:text-white transition">Catálogo</a>
          <a href="#planes"   className="hover:text-white transition">Planes</a>
          <a href="#como-funciona" className="hover:text-white transition">Cómo funciona</a>
          <a href="/contacto" className="hover:text-white transition">Contacto</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/acceso-evaluacion"
            className="hidden sm:inline-flex text-sm text-slate-200 hover:text-white px-3 py-2"
          >
            Soy candidato
          </a>
          <a
            href="/login"
            className="hidden md:inline-flex text-sm text-slate-200 hover:text-white px-3 py-2"
          >
            Iniciar sesión
          </a>
          <a
            href="/registro"
            className="inline-flex items-center rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 transition shadow-glow"
          >
            Crear cuenta
          </a>
        </div>
      </nav>
    </header>
  );
}