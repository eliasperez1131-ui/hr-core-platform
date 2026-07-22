'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  REACTIVOS_INTEGRIDAD,
  PRUEBA_META,
  DURACION_SEGUNDOS,
  MAX_ABANDONOS,
} from '@/lib/evaluation/integrity-test';
import { calculateScore } from '@/lib/evaluation/scoring';
import {
  useCountdown,
  useAbandonDetector,
  useCopyPasteBlocker,
} from '@/lib/evaluation/security';

import EvaluationIntro   from './EvaluationIntro';
import QuestionCard      from './QuestionCard';
import ProgressBar       from './ProgressBar';
import Timer             from './Timer';
import SecurityModal     from './SecurityModal';
import EvaluationResult  from './EvaluationResult';

const PHASES = {
  INTRO:    'intro',
  RUNNING:  'running',
  SUBMITTED:'submitted',
  CANCELLED:'cancelled',
};

/**
 * EvaluationEngine — orquestador del motor de evaluación.
 *
 * State machine:
 *   intro  → (onStart)   → running
 *   running → (timer 0)  → submitted (auto)
 *   running → (3 strikes)→ cancelled
 *   running → (manual)   → submitted
 *   submitted / cancelled → fin
 *
 * Props:
 *   candidatoId    -> string
 *   candidatoNombre-> string (opcional)
 *   onSubmit(result) -> callback con el resultado al enviar
 */
export default function EvaluationEngine({ candidatoId, candidatoNombre, onSubmit }) {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState({}); // { [id]: 1..5 }
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [submissionReason, setSubmissionReason] = useState('');

  // ── Hooks de seguridad ──────────────────────────────────────
  const { mm, ss, percent: timePercent, critical } = useCountdown({
    duracionSegundos: DURACION_SEGUNDOS,
    onExpire: () => {
      if (phase === PHASES.RUNNING) {
        setSubmissionReason('Tiempo agotado · auto-envío');
        setPhase(PHASES.SUBMITTED);
      }
    },
    paused: phase !== PHASES.RUNNING,
  });

  const { abandonos, cancelado } = useAbandonDetector({
    active: phase === PHASES.RUNNING,
    onAbandon: () => setSecurityModalOpen(true),
    onCancel: () => {
      setSubmissionReason('Cancelada por abandonar la pestaña más de 3 veces');
      setPhase(PHASES.CANCELLED);
      setSecurityModalOpen(false);
    },
  });

  useCopyPasteBlocker(phase === PHASES.RUNNING);

  // ── Cálculo en tiempo real ──────────────────────────────────
  const liveResult = useMemo(
    () => calculateScore(respuestas, REACTIVOS_INTEGRIDAD),
    [respuestas],
  );

  // ── Handlers ────────────────────────────────────────────────
  const onStart = useCallback(() => {
    setPhase(PHASES.RUNNING);
    setCurrentIndex(0);
    setRespuestas({});
    setSecurityModalOpen(false);
  }, []);

  const onSelect = useCallback((valor) => {
    const pregunta = REACTIVOS_INTEGRIDAD[currentIndex];
    if (!pregunta) return;
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }));
  }, [currentIndex]);

  const onNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, REACTIVOS_INTEGRIDAD.length - 1));
  }, []);
  const onPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleSubmit = useCallback((razon = 'Envío manual') => {
    setSubmissionReason(razon);
    setPhase(PHASES.SUBMITTED);
  }, []);

  // Cuando se completa la última pregunta, no auto-envía: el usuario decide.
  useEffect(() => {
    if (phase !== PHASES.RUNNING) return;
    if (cancelado && phase === PHASES.RUNNING) {
      setSubmissionReason('Cancelada por abandonar la pestaña');
      setPhase(PHASES.CANCELLED);
    }
  }, [cancelado, phase]);

  // Cuando se llega al resultado, propagarlo al padre
  useEffect(() => {
    if ((phase === PHASES.SUBMITTED || phase === PHASES.CANCELLED) && onSubmit) {
      onSubmit({
        candidato_id: candidatoId,
        respuestas,
        result: liveResult,
        abandonos,
        razon: submissionReason,
        timestamp: new Date().toISOString(),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Render ──────────────────────────────────────────────────
  if (phase === PHASES.INTRO) {
    return <EvaluationIntro candidatoNombre={candidatoNombre} onStart={onStart} />;
  }

  if (phase === PHASES.SUBMITTED) {
    return (
      <EvaluationResult
        result={liveResult}
        candidato={{ nombre_completo: candidatoNombre }}
        onRestart={onStart}
      />
    );
  }

  if (phase === PHASES.CANCELLED) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-rose-100 grid place-items-center mb-4">
            <svg className="h-7 w-7 text-rose-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-rose-900">
            Prueba cancelada
          </h2>
          <p className="mt-2 text-sm text-rose-800">
            {submissionReason ||
              `Has alcanzado el máximo de ${MAX_ABANDONOS} abandonos de pestaña.`}
          </p>
          <p className="mt-3 text-xs text-rose-700">
            Se notificará al reclutador para reagendar.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 inline-flex rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Volver a intentar (demo)
          </button>
        </div>
      </div>
    );
  }

  // PHASES.RUNNING
  const pregunta = REACTIVOS_INTEGRIDAD[currentIndex];
  const respondidas = Object.keys(respuestas).length;
  const progressPercent = Math.round((respondidas / REACTIVOS_INTEGRIDAD.length) * 100);
  const value = respuestas[pregunta.id];

  const isLast = currentIndex === REACTIVOS_INTEGRIDAD.length - 1;
  const allAnswered = respondidas === REACTIVOS_INTEGRIDAD.length;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Topbar con timer + progreso + candado */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 mb-6 bg-slate-50/95 backdrop-blur px-4 sm:px-6 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Timer mm={mm} ss={ss} percent={timePercent} critical={critical} />
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-900 text-white text-[11px] font-bold px-2 py-1">
              🔒 {abandonos}/{MAX_ABANDONOS}
            </span>
          </div>
          <div className="flex-1 min-w-[180px] max-w-md">
            <ProgressBar
              current={respondidas}
              total={REACTIVOS_INTEGRIDAD.length}
              percent={progressPercent}
            />
          </div>
          <button
            type="button"
            onClick={() => handleSubmit('Envío manual')}
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 transition"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Pregunta actual */}
      <QuestionCard
        pregunta={pregunta}
        index={currentIndex + 1}
        total={REACTIVOS_INTEGRIDAD.length}
        value={value}
        onChange={onSelect}
      />

      {/* Navegación */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="text-xs text-slate-500 text-center">
          {value ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Respondida
            </span>
          ) : (
            <span className="text-slate-400">Selecciona una opción para continuar</span>
          )}
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={() => handleSubmit('Última pregunta alcanzada')}
            disabled={!allAnswered}
            className="inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar evaluación ✓
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center rounded-md bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-glow"
          >
            Siguiente →
          </button>
        )}
      </div>

      {/* Mini-mapa de progreso (cuadrícula de preguntas) */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Mapa de preguntas
        </p>
        <div className="grid grid-cols-15 gap-1">
          {REACTIVOS_INTEGRIDAD.map((r, i) => {
            const answered = respuestas[r.id] != null;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                title={`Pregunta ${i + 1}${answered ? ' · respondida' : ''}`}
                className={[
                  'h-6 w-full rounded text-[9px] font-mono font-bold transition',
                  isCurrent
                    ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                    : answered
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                ].join(' ')}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de seguridad */}
      <SecurityModal
        open={securityModalOpen}
        abandonos={abandonos}
        onResume={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}