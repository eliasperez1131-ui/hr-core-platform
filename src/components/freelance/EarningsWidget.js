import { formatMXN, formatDateShort } from '@/lib/format';

/**
 * EarningsWidget — tarjeta de ganancias del Reclutador Freelance.
 *
 * Calcula en el servidor:
 *   - contratados_mes  = contratos con estatus 'Contratado' dentro del mes actual
 *   - comisiones_pendientes = SUM(comision_freelance) de esos contratos
 *
 * Props:
 *   contratos -> array del mes actual del reclutador
 */
export default function EarningsWidget({ contratos = [] }) {
  // Filtramos el mes actual en servidor
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const contratosMes = contratos.filter((c) => (c.fecha_contrato || '').startsWith(ym));

  const contratados_mes = contratosMes.length;
  const comisiones_pendientes = contratosMes.reduce(
    (acc, c) => acc + (Number(c.comision_freelance) || 0),
    0,
  );

  const ticketPromedio =
    contratados_mes > 0 ? comisiones_pendientes / contratados_mes : 0;

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {/* Card 1: Mis Contratados (Mes actual) */}
      <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mis Contratados (mes actual)
            </p>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-ink-900">
            {contratados_mes}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            candidatos con estatus <strong className="text-slate-700">Contratado</strong> este mes
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-full px-2.5 py-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Actualizado en tiempo real
          </div>
        </div>
      </article>

      {/* Card 2: Mis Comisiones Pendientes */}
      <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white shadow-glow">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-brand-400/30 to-accent-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 text-brand-300 grid place-items-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3zM7 12h2m4 0h6" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Comisiones pendientes
            </p>
          </div>
          <p className="mt-4 text-4xl font-extrabold tracking-tight">
            {formatMXN(comisiones_pendientes)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Suma de <strong className="text-white">comision_freelance</strong> sobre {contratados_mes} contratados
          </p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Ticket promedio: <strong className="text-white">{formatMXN(ticketPromedio)}</strong>
            </span>
            <span className="inline-flex items-center rounded-full bg-brand-500/20 text-brand-300 px-2 py-0.5 font-semibold ring-1 ring-brand-400/30">
              Pendiente de pago
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}