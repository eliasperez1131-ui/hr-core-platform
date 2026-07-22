const STATUS_STYLES = {
  'Top Match': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Apto':      'bg-sky-50 text-sky-700 ring-sky-200',
  'Revisar':   'bg-amber-50 text-amber-700 ring-amber-200',
  'No Apto':   'bg-rose-50 text-rose-700 ring-rose-200',
  'Pendiente': 'bg-slate-100 text-slate-700 ring-slate-200',
};

const PRUEBA_COLORS = {
  'Integridad Organizacional': 'bg-emerald-100 text-emerald-700',
  'Razonamiento Lógico':      'bg-blue-100 text-blue-700',
  'Perfil Big Five':          'bg-violet-100 text-violet-700',
  'Motivadores Laborales':    'bg-amber-100 text-amber-700',
  'Liderazgo Situacional':    'bg-rose-100 text-rose-700',
  'Competencias Comerciales': 'bg-cyan-100 text-cyan-700',
  'Servicio al Cliente':      'bg-indigo-100 text-indigo-700',
};

import { relativeTime } from '@/lib/format';

export default function ActivityTable({ rows = [] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Aún no hay actividad reciente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-ink-900">Actividad reciente</h3>
        <a href="#" className="text-xs font-medium text-brand-600 hover:underline">Ver todas →</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th>Candidato</Th>
              <Th>Vacante</Th>
              <Th>Prueba</Th>
              <Th>Score</Th>
              <Th>Estatus</Th>
              <Th>Completado</Th>
              <Th className="text-right">Acción</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-none rounded-full bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-xs font-bold text-white">
                      {r.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{r.candidato}</p>
                      <p className="text-xs text-slate-500 truncate">{r.correo || '—'}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-sm text-slate-700">{r.vacante}</span>
                </Td>
                <Td>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${PRUEBA_COLORS[r.prueba] || 'bg-slate-100 text-slate-700'}`}>
                    {r.prueba}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink-900">{r.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </Td>
                <Td>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLES[r.estatus] || STATUS_STYLES.Pendiente}`}>
                    {r.estatus}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-slate-500">{relativeTime(r.completado_en)}</span>
                </Td>
                <Td className="text-right">
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-800">
                    Ver detalle
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-5 py-4 ${className}`}>{children}</td>;
}