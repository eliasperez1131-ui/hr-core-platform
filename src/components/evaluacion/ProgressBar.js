export default function ProgressBar({ current, total, percent }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">
          Pregunta <span className="text-brand-600">{current}</span> de {total}
        </span>
        <span className="font-mono text-slate-500">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}