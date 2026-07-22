/**
 * EmptyState — placeholder visual cuando una lista está vacía.
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 grid place-items-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}