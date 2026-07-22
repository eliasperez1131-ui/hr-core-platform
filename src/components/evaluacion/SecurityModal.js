import { MAX_ABANDONOS } from '@/lib/evaluation/integrity-test';

/**
 * SecurityModal — modal rojo de advertencia por abandono de pestaña.
 * Se muestra cada vez que el candidato cambia de tab / pierde foco.
 *
 * Props:
 *   open        -> boolean
 *   abandonos   -> número de abandonos actuales
 *   onResume    -> callback para cerrar (botón "He vuelto")
 */
export default function SecurityModal({ open, abandonos, onResume }) {
  if (!open) return null;

  const restantes = MAX_ABANDONOS - abandonos;
  const esUltimo = restantes <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-rose-600 text-white shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/15 grid place-items-center mb-4 animate-pulse">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">
            ⚠️ Abandono detectado
          </h2>

          <p className="mt-3 text-sm text-rose-50">
            Se detectó que <strong>saliste de la pantalla de evaluación</strong>.
            Esta acción queda registrada en bitácora.
          </p>

          {esUltimo ? (
            <div className="mt-4 rounded-md bg-rose-800/60 p-3 text-sm font-bold">
              Has alcanzado el máximo de {MAX_ABANDONOS} abandonos.
              <br />
              <span className="font-normal">Tu prueba ha sido <strong>cancelada automáticamente</strong>.</span>
            </div>
          ) : (
            <div className="mt-4 rounded-md bg-rose-800/60 p-3 text-sm">
              Te{' '}
              <strong>
                {restantes} {restantes === 1 ? 'oportunidad' : 'oportunidades'}
              </strong>{' '}
              antes de que la prueba sea invalidada automáticamente.
            </div>
          )}

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span>🚨</span>
            Abandono #{abandonos} de {MAX_ABANDONOS}
          </div>
        </div>

        {!esUltimo && (
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <button
              type="button"
              onClick={onResume}
              className="w-full rounded-md bg-white text-rose-700 hover:bg-rose-50 px-5 py-3 text-sm font-bold transition shadow"
            >
              He vuelto, continuar la prueba
            </button>
          </div>
        )}
      </div>
    </div>
  );
}