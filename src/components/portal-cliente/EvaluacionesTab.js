'use client';

import Link from 'next/link';
import CreditBalance    from '@/components/dashboard/CreditBalance';
import StatCard         from '@/components/dashboard/StatCard';
import ActivityTable    from '@/components/dashboard/ActivityTable';
import DelicadaBadge    from '@/components/dashboard/DelicadaBadge';
import {
  WORKSPACE_DEMO,
  ACTIVIDAD_RECIENTE,
  VACANTES_ASIGNADAS_FREELANCE,
} from '@/lib/dashboard-data';

/**
 * EvaluacionesTab — Tab 1: SaaS.
 * Reutiliza los componentes del dashboard SaaS clásico
 * (CreditBalance, StatCard, ActivityTable, MisVacantes).
 */
export default function EvaluacionesTab() {
  const ws = WORKSPACE_DEMO;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-ink-900">Tus Evaluaciones</h2>
        <p className="text-sm text-slate-600 mt-1">
          Gestiona tus vacantes, aplica pruebas psicométricas y monitorea candidatos en piloto automático.
        </p>
      </div>

      {/* 1. Saldo + KPIs */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CreditBalance plan={ws.plan_activo} />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <StatCard
            label="Vacantes abiertas"
            value="8"
            hint="2 cerradas este mes"
            delta="+2"
            deltaTone="up"
            icon={<path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />}
          />
          <StatCard
            label="Candidatos evaluados"
            value="187"
            hint="Del total de créditos"
            delta="+24%"
            deltaTone="up"
            icon={<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM3 21v-1a6 6 0 0112 0v1" />}
          />
        </div>
      </div>

      {/* 2. CTA principal */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 p-8 lg:p-10">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-white max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                ✨ Modo SaaS
              </span>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight">
                Crea una nueva vacante en menos de 2 minutos
              </h3>
              <p className="mt-2 text-brand-100">
                Configura puesto, turnos, sueldo y privacidad financiera. Las 7 pruebas se aplican automáticamente.
              </p>
            </div>
            <Link
              href="/crear-vacante"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 hover:bg-brand-50 px-8 py-4 text-base font-bold transition shadow-2xl"
            >
              + Crear Nueva Vacante
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Vacantes activas */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-ink-900">Mis vacantes activas</h3>
            <span className="text-xs text-slate-500">
              {VACANTES_ASIGNADAS_FREELANCE.filter((v) => v.es_delicada).length} delicadas
            </span>
          </div>
          <Link href="/crear-vacante" className="text-xs font-medium text-brand-600 hover:text-brand-800">
            + Nueva
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {VACANTES_ASIGNADAS_FREELANCE.map((v) => (
            <li key={v.id} className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50">
              <div className="flex items-start gap-3 min-w-0">
                {v.es_delicada && (
                  <div className="mt-0.5 flex-none">
                    <DelicadaBadge size="md" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{v.titulo_puesto}</p>
                  <p className="text-xs text-slate-500">
                    {v.tipo_jornada} · {v.detalle_turno} · {v.ubicacion}
                  </p>
                </div>
              </div>
              <div className="text-right flex-none">
                <p className="text-sm font-bold text-ink-900">{v.candidatos_activos}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">candidatos</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Actividad reciente */}
      <ActivityTable rows={ACTIVIDAD_RECIENTE} />
    </div>
  );
}