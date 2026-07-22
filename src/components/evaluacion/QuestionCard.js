import { ESCALA_LIKERT } from '@/lib/evaluation/integrity-test';

const TONE_STYLES = {
  rose:    { base: 'border-rose-200 bg-rose-50',     active: 'border-rose-500 bg-rose-100 ring-4 ring-rose-200',    text: 'text-rose-700'    },
  orange:  { base: 'border-orange-200 bg-orange-50', active: 'border-orange-500 bg-orange-100 ring-4 ring-orange-200', text: 'text-orange-700'  },
  slate:   { base: 'border-slate-200 bg-slate-50',   active: 'border-slate-500 bg-slate-100 ring-4 ring-slate-200', text: 'text-slate-700'   },
  sky:     { base: 'border-sky-200 bg-sky-50',       active: 'border-sky-500 bg-sky-100 ring-4 ring-sky-200',     text: 'text-sky-700'     },
  emerald: { base: 'border-emerald-200 bg-emerald-50', active: 'border-emerald-500 bg-emerald-100 ring-4 ring-emerald-200', text: 'text-emerald-700' },
};

/**
 * QuestionCard — UNA pregunta + 5 opciones Likert grandes.
 *
 * Props:
 *   pregunta       -> { id, dimension, reactivo, isInverted, weight }
 *   index          -> número de pregunta (1-based)
 *   total          -> total de preguntas
 *   value          -> valor seleccionado (1..5) o undefined
 *   onChange(v)    -> callback al elegir un valor
 */
export default function QuestionCard({ pregunta, index, total, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
      {/* Header de la pregunta */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {pregunta.dimension}
          {pregunta.weight > 1 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider">
              ×{pregunta.weight} peso
            </span>
          )}
        </span>
        <span className="text-xs font-mono text-slate-500">
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Enunciado */}
      <h2 className="text-xl sm:text-2xl font-semibold text-ink-900 leading-snug">
        {pregunta.reactivo}
      </h2>

      {/* Escala Likert */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">
          Indica tu grado de acuerdo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ESCALA_LIKERT.map((op) => {
            const isActive = value === op.value;
            const styles = TONE_STYLES[op.tono] || TONE_STYLES.slate;
            return (
              <button
                key={op.value}
                type="button"
                onClick={() => onChange(op.value)}
                className={[
                  'group flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-4 text-center transition',
                  isActive ? styles.active : `${styles.base} hover:scale-[1.02]`,
                ].join(' ')}
                aria-pressed={isActive}
              >
                <span className={`text-2xl font-extrabold tabular-nums ${isActive ? styles.text : 'text-slate-700'}`}>
                  {op.value}
                </span>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isActive ? styles.text : 'text-slate-500'}`}>
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pregunta.isInverted && (
        <p className="mt-5 text-[11px] text-slate-400 italic text-center">
          * Reactivo con puntaje invertido (control de respuesta).
        </p>
      )}
    </div>
  );
}