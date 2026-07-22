import { PRUEBA_META } from '@/lib/evaluation/integrity-test';

/**
 * EvaluationIntro — pantalla previa al examen con:
 *  - Descripción de la prueba
 *  - Reglas (cronómetro, anti-trampa)
 *  - Botón "Comenzar evaluación"
 *
 * Props:
 *   candidatoNombre  -> string
 *   onStart()        -> callback al iniciar
 */
export default function EvaluationIntro({ candidatoNombre, onStart }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {PRUEBA_META.codigo} · {PRUEBA_META.duracion_minutos} min
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">
            {PRUEBA_META.nombre}
          </h1>
          {candidatoNombre && (
            <p className="mt-2 text-sm text-slate-500">
              Bienvenido/a, <strong className="text-ink-900">{candidatoNombre}</strong>.
            </p>
          )}
          <p className="mt-4 text-base text-slate-600 max-w-md mx-auto">
            {PRUEBA_META.descripcion}
          </p>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
          <Stat label="Preguntas" value={PRUEBA_META.total_preguntas} />
          <Stat label="Duración"   value={`${PRUEBA_META.duracion_minutos} min`} />
          <Stat label="Escala"     value="Likert 1-5" />
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Antes de comenzar, ten en cuenta:
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-amber-900 list-disc ml-5">
            <li>Dispones de <strong>{PRUEBA_META.duracion_minutos} minutos</strong> en total. Si se acaba el tiempo, la prueba se envía automáticamente con lo respondido.</li>
            <li>No puedes <strong>salir de la pestaña</strong> ni minimizar el navegador. Hasta <strong>3 abandonos</strong> son tolerados; al cuarto, la prueba se cancela.</li>
            <li>No se permite copiar, pegar ni abrir las herramientas de desarrollo.</li>
            <li>Responde con honestidad. No hay respuestas correctas ni incorrectas; evaluamos tu perfil de integridad.</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 px-8 py-3.5 text-sm font-bold text-white transition shadow-glow"
          >
            Estoy listo, comenzar evaluación →
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-ink-900">{value}</p>
    </div>
  );
}