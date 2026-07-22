/**
 * DelicadaBadge — distintivo visual rojo para vacantes marcadas
 * como `es_delicada = true`. Reutilizable en cualquier dashboard.
 *
 * Props:
 *   size  -> 'sm' | 'md' | 'lg'
 *   withLabel -> boolean (muestra texto o solo icono)
 *   className -> clases adicionales
 */
export default function DelicadaBadge({ size = 'sm', withLabel = true, className = '' }) {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      title="Vacante delicada — los candidatos requieren aprobación manual del Coordinador antes de ser visibles al cliente."
      className={[
        'inline-flex items-center rounded-md font-bold uppercase tracking-wider',
        'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
        sizes[size] || sizes.sm,
        className,
      ].join(' ')}
    >
      <svg
        className={iconSizes[size] || iconSizes.sm}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      {withLabel && <span>Delicada</span>}
    </span>
  );
}