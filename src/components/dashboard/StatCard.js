/**
 * StatCard — tarjeta KPI reutilizable en dashboards.
 *
 * Props:
 *   label       -> string corto arriba
 *   value       -> valor principal (string o number)
 *   hint        -> texto pequeño debajo
 *   delta       -> string con cambio (+12% este mes)
 *   deltaTone   -> 'up' | 'down' | 'neutral'
 *   icon        -> SVG path
 *   iconBg      -> clases tailwind para el fondo del icono
 */
export default function StatCard({
  label,
  value,
  hint,
  delta,
  deltaTone = 'neutral',
  icon,
  iconBg = 'bg-brand-50 text-brand-600',
}) {
  const tone =
    deltaTone === 'up'
      ? 'text-emerald-700 bg-emerald-50'
      : deltaTone === 'down'
        ? 'text-rose-700 bg-rose-50'
        : 'text-slate-600 bg-slate-100';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-ink-900 truncate">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && (
          <div className={`h-10 w-10 rounded-lg grid place-items-center flex-none ${iconBg}`}>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              {icon}
            </svg>
          </div>
        )}
      </div>
      {delta && (
        <div className="mt-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
            {delta}
          </span>
        </div>
      )}
    </div>
  );
}