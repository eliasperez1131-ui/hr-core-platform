'use client';

/**
 * PaywallOverlay — Envoltura que desenfoca u oculta datos sensibles
 * de contacto cuando hay deuda activa.
 *
 * Uso:
 *   <PaywallOverlay bloqueada={true} factura={factura}>
 *     <span>📞 +52 55 4422 8831</span>
 *     <span>📧 ana@gmail.com</span>
 *   </PaywallOverlay>
 *
 * Si bloqueada=true, el contenido se renderiza con filter:blur y
 * un overlay con candado + texto. Si false, renderiza tal cual.
 *
 * Si mode="hide", directamente no renderiza nada dentro (para cosas
 * sensibles como el botón de descargar CV).
 */
export default function PaywallOverlay({ bloqueada, factura, mode = 'blur', children, className = '' }) {
  if (!bloqueada) {
    return <div className={className}>{children}</div>;
  }

  if (mode === 'hide') {
    return (
      <div className={`relative inline-flex items-center justify-center rounded-lg border-2 border-dashed border-rose-300 bg-rose-50 px-4 py-3 ${className}`}>
        <div className="flex items-center gap-2 text-rose-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">Bloqueado</span>
        </div>
      </div>
    );
  }

  // mode = "blur"
  return (
    <div className={`relative ${className}`}>
      {/* Contenido con blur */}
      <div
        aria-hidden={true}
        className="select-none pointer-events-none"
        style={{ filter: 'blur(8px)', userSelect: 'none' }}
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl bg-white/95 backdrop-blur-sm ring-2 ring-rose-200 px-5 py-4 shadow-xl text-center max-w-xs">
          <div className="mx-auto h-10 w-10 rounded-full bg-rose-100 grid place-items-center text-rose-600 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-ink-900">Datos bloqueados</p>
          <p className="mt-1 text-xs text-slate-600">
            Liquida la factura para desbloquear los datos de contacto del candidato.
          </p>
          {factura && (
            <p className="mt-2 text-[10px] uppercase tracking-wider text-rose-700 font-bold">
              Factura {factura.id.slice(0, 8)} · {factura.estatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PaywallBanner — Banner superior que aparece cuando hay deuda.
 */
export function PaywallBanner({ bloqueada, factura, onPagar }) {
  if (!bloqueada) return null;
  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-none h-12 w-12 rounded-full bg-rose-500 text-white grid place-items-center text-2xl">
          🔒
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-rose-900">
            Hay una factura pendiente que bloquea los datos de contacto
          </h3>
          <p className="mt-1 text-sm text-rose-800">
            Para ver el teléfono, correo y CV del candidato, liquida el cargo pendiente de{' '}
            <strong>${factura?.monto?.toLocaleString('es-MX')} MXN</strong>.
          </p>
        </div>
        {onPagar && (
          <button
            type="button"
            onClick={onPagar}
            className="inline-flex shrink-0 items-center rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 transition shadow"
          >
            Pagar ahora →
          </button>
        )}
      </div>
    </div>
  );
}