/**
 * Timer — cronómetro regresivo con estilo de "candado".
 * Cambia a rojo crítico cuando quedan menos de 60 segundos.
 */
export default function Timer({ mm, ss, percent, critical }) {
  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono',
        critical
          ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse'
          : 'border-slate-200 bg-white text-ink-900',
      ].join(' ')}
      role="timer"
      aria-live="polite"
    >
      <svg
        className={['h-4 w-4', critical ? 'text-rose-600' : 'text-slate-500'].join(' ')}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm font-bold tracking-wider tabular-nums">
        {mm}:{ss}
      </span>
      <span className="hidden sm:inline text-[10px] uppercase tracking-wider opacity-60">
        restante
      </span>
    </div>
  );
}