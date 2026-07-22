import Link from 'next/link';
import AuthBranding from './AuthBranding';

/**
 * Layout compartido para /login, /registro y /recuperar-password.
 * Split-screen: branding a la izquierda, formulario a la derecha.
 *
 * Props:
 *   title       -> string
 *   subtitle    -> string
 *   children    -> el formulario
 *   footer      -> ReactNode (texto + enlace abajo del form)
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <AuthBranding />

      <div className="flex flex-col">
        {/* Topbar móvil con logo */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
              HR
            </div>
            <span className="text-lg font-bold text-ink-900">
              HR<span className="text-brand-600">CORE</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Volver al sitio
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="hidden lg:flex justify-end mb-6">
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
                ← Volver al sitio
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
                {footer}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
          © {new Date().getFullYear()} HR CORE. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}