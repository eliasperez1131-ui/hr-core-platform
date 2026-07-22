import { PRUEBA_META } from '@/lib/evaluation/integrity-test';
import EvaluationEngine    from '@/components/evaluacion/EvaluationEngine';
import EvaluationAuthGuard from '@/components/evaluacion/EvaluationAuthGuard';
import { createAdminClient } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';

/**
 * Página pública de la evaluación psicométrica.
 *
 *   /evaluacion/[candidato_id]
 *
 * Protegida con EvaluationAuthGuard: el candidato debe haber pasado
 * por /acceso-evaluacion para poder ver esta página.
 */
export async function generateMetadata({ params }) {
  return {
    title: `${PRUEBA_META.nombre} · HR CORE`,
    description: 'Evaluación psicométrica de integridad organizacional.',
    robots: { index: false, follow: false },
  };
}

async function fetchCandidato(id) {
  if (!id || id === 'demo') {
    return { id: 'demo', nombre_completo: 'Candidato Demo' };
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('candidatos')
      .select('id, nombre_completo, estatus_reclutamiento')
      .eq('id', id)
      .maybeSingle();
    return data || { id, nombre_completo: 'Candidato', estatus_reclutamiento: 'Pendiente' };
  } catch {
    return { id, nombre_completo: 'Candidato', estatus_reclutamiento: 'Pendiente' };
  }
}

export default async function EvaluacionPage({ params }) {
  const { candidato_id } = params;
  if (!candidato_id) notFound();

  const candidato = await fetchCandidato(candidato_id);

  return (
    <EvaluationAuthGuard candidatoId={candidato.id} candidatoNombre={candidato.nombre_completo}>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center font-black text-white">
                HR
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight">
                  HR<span className="text-brand-600">CORE</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 leading-tight">
                  Motor de Evaluaciones
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sesión segura · conexión cifrada
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <EvaluationEngine
            candidatoId={candidato.id}
            candidatoNombre={candidato.nombre_completo}
            onSubmit={async (payload) => {
              try {
                await fetch('/api/evaluacion/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
              } catch {
                /* offline: el resultado ya se muestra al candidato */
              }
            }}
          />
        </main>
      </div>
    </EvaluationAuthGuard>
  );
}