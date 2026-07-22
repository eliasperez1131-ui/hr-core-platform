'use client';

import { formatDateShort } from '@/lib/format';

const ESTATUS_BADGE = {
  'Apto':                       'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Top Match':                  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Contratado':                 'bg-brand-50 text-brand-700 ring-brand-200',
  'Postulado':                  'bg-slate-100 text-slate-700 ring-slate-200',
  'Revisar':                    'bg-amber-50 text-amber-700 ring-amber-200',
  'Rechazado':                  'bg-rose-50 text-rose-700 ring-rose-200',
  'No Apto':                    'bg-rose-50 text-rose-700 ring-rose-200',
  'Abandono':                   'bg-orange-50 text-orange-700 ring-orange-200',
  'Inasistencia':               'bg-orange-50 text-orange-700 ring-orange-200',
  'Pendiente de Aprobación':    'bg-amber-50 text-amber-700 ring-amber-200',
};

/**
 * VincularCandidatoModal — ventana emergente que muestra el
 * historial completo de un candidato que ya existe en la BD.
 *
 * Props:
 *   open         -> boolean
 *   onClose      -> () => void
 *   candidato    -> objeto con datos del candidato existente
 *   historial    -> array de postulaciones previas
 *   onConfirm    -> async () => void  (vincula a la nueva vacante)
 *   loading      -> boolean (estado del botón confirmar)
 */
export default function VincularCandidatoModal({
  open,
  onClose,
  candidato,
  historial = [],
  onConfirm,
  loading = false,
}) {
  if (!open || !candidato) return null;

  const stats = {
    participadas: candidato.vacantes_participadas ?? historial.length,
    inasistencias: candidato.inasistencias ?? historial.filter((h) => h.asistido === false).length,
    abandonos:    candidato.abandonos        ?? historial.filter((h) => h.estatus === 'Abandono').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-5 rounded-t-2xl text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 flex-none rounded-full bg-white/20 grid place-items-center text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold">Candidato ya registrado</h3>
                <p className="text-sm text-amber-50 mt-0.5">
                  Encontramos un historial previo. Revisa antes de continuar.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Datos del candidato */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 flex-none rounded-full bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-white text-base font-bold">
              {candidato.nombre_completo.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-ink-900">{candidato.nombre_completo}</h4>
              <p className="text-sm text-slate-600 mt-1">
                {candidato.correo} · {candidato.telefono}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {candidato.edad && `${candidato.edad} años`}
                {candidato.escolaridad && ` · ${candidato.escolaridad}`}
                {candidato.estado && ` · ${candidato.estado}${candidato.municipio ? `, ${candidato.municipio}` : ''}`}
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <KpiBox
              icon="📋"
              label="Vacantes participadas"
              value={stats.participadas}
              tone="brand"
            />
            <KpiBox
              icon="🚫"
              label="Inasistencias"
              value={stats.inasistencias}
              tone={stats.inasistencias > 0 ? 'rose' : 'slate'}
            />
            <KpiBox
              icon="⚠️"
              label="Abandonos"
              value={stats.abandonos}
              tone={stats.abandonos > 0 ? 'rose' : 'slate'}
            />
          </div>
        </div>

        {/* Historial de postulaciones */}
        <div className="px-6 py-5">
          <h5 className="text-sm font-semibold text-ink-900 mb-3">
            Historial de postulaciones ({historial.length})
          </h5>

          {historial.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Este candidato no tiene postulaciones previas, pero ya existía en la base de datos.
            </p>
          ) : (
            <ol className="space-y-3">
              {historial.map((h) => (
                <li key={h.id} className="relative pl-7 pb-3 border-l-2 border-slate-200 last:border-transparent last:pb-0">
                  <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-slate-300 ring-4 ring-white" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {h.vacante || 'Vacante'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {h.empresa ? `${h.empresa} · ` : ''}{formatDateShort(h.fecha)}
                        {typeof h.puntuacion === 'number' && ` · Score: ${h.puntuacion}`}
                      </p>
                      {h.asistido === false && (
                        <p className="text-xs text-rose-600 mt-0.5">⚠ No se presentó</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 flex-none ${ESTATUS_BADGE[h.estatus] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                      {h.estatus}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            ¿Deseas vincular a este candidato a la nueva vacante de todos modos?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition shadow-glow disabled:opacity-60"
            >
              {loading ? 'Vinculando…' : 'Sí, vincular a la vacante'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiBox({ icon, label, value, tone = 'slate' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    rose:  'bg-rose-50 text-rose-700 ring-rose-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
  };
  return (
    <div className={`rounded-lg p-3 ring-1 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}