/**
 * CreditBalance — barra superior con saldo de créditos y plan activo.
 *
 * Props:
 *   plan              -> 'Starter' | 'Professional' | 'Enterprise'
 *   creditos_incluidos-> total del plan (int)
 *   creditos_usados   -> consumidos (int)
 *   renovacion        -> string ISO de fecha de renovación
 */
import { PLANES_DEMO } from '@/lib/dashboard-data';

const PLAN_BADGE = {
  Trial:       'bg-slate-100 text-slate-700',
  Starter:     'bg-sky-50 text-sky-700',
  Professional:'bg-brand-50 text-brand-700',
  Enterprise:  'bg-amber-50 text-amber-700',
  Custom:      'bg-violet-50 text-violet-700',
};

export default function CreditBalance({ plan = 'Professional', creditos_incluidos, creditos_usados, renovacion }) {
  const cfg = PLANES_DEMO[plan] || PLANES_DEMO.Professional;
  const usados      = creditos_usados   ?? cfg.creditos_usados;
  const incluidos   = creditos_incluidos ?? cfg.creditos_incluidos;
  const disponibles = Math.max(incluidos - usados, 0);
  const pct = Math.min(100, Math.round((usados / incluidos) * 100));

  const lowBalance = disponibles / incluidos < 0.2;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 grid place-items-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3zM7 12h2m4 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Plan activo
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-ink-900">{plan}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${PLAN_BADGE[plan] || PLAN_BADGE.Starter}`}>
                {plan === 'Trial' ? 'Prueba' : 'Activo'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500">Próxima renovación</p>
          <p className="text-sm font-medium text-ink-900">{renovacion || cfg.renovacion}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-slate-600">
            <strong className="text-ink-900">{disponibles.toLocaleString('es-MX')}</strong>{' '}
            créditos disponibles
          </span>
          <span className="text-xs text-slate-500">
            {usados.toLocaleString('es-MX')} / {incluidos.toLocaleString('es-MX')} usados
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={[
              'h-full rounded-full transition-all',
              lowBalance ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-brand-500',
            ].join(' ')}
            style={{ width: `${pct}%` }}
          />
        </div>
        {lowBalance && (
          <p className="mt-2 text-xs text-rose-600">
            ⚠️ Saldo bajo. Considera ampliar tu plan para evitar interrupciones.
          </p>
        )}
      </div>
    </div>
  );
}