import { formatMXN } from '@/lib/format';
import ShareLinkButton from '@/components/share/ShareLinkButton';
import DelicadaBadge from '@/components/dashboard/DelicadaBadge';

const STATUS_BADGE = {
  Abierta: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pausada: 'bg-amber-50 text-amber-700 ring-amber-200',
  Cerrada: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const JORNADA_BADGE = {
  Fijo:    'bg-sky-50 text-sky-700',
  Rolado:  'bg-violet-50 text-violet-700',
  Ciclico: 'bg-rose-50 text-rose-700',
};

/**
 * AssignedVacanciesTable — tabla de vacantes asignadas al reclutador.
 * Muestra solo datos OPERATIVOS (sin cobro_cliente ni comision_freelance).
 */
export default function AssignedVacanciesTable({ rows = [] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          Aún no tienes vacantes asignadas. Pide a tu coordinador que te asigne una.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Vacantes asignadas</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Solo datos operativos. La información financiera permanece oculta.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {rows.length} {rows.length === 1 ? 'vacante' : 'vacantes'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th>Puesto</Th>
              <Th>Turno</Th>
              <Th>Modalidad</Th>
              <Th>Ubicación</Th>
              <Th>Sueldo candidato</Th>
              <Th>Candidatos</Th>
              <Th>Estatus</Th>
              <Th className="text-right">Acción</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <Td>
                  <div className="flex items-start gap-2">
                    {v.es_delicada && (
                      <div className="mt-0.5 flex-none">
                        <DelicadaBadge size="sm" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink-900">{v.titulo_puesto}</p>
                      <p className="text-xs text-slate-500">{v.empresa}</p>
                      {v.es_delicada && (
                        <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                          Coordinación manual con Administrador
                        </p>
                      )}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex w-fit items-center rounded px-2 py-0.5 text-[11px] font-semibold ${JORNADA_BADGE[v.tipo_jornada] || 'bg-slate-100 text-slate-700'}`}>
                      {v.tipo_jornada}
                    </span>
                    <span className="text-xs text-slate-600">{v.detalle_turno}</span>
                  </div>
                </Td>
                <Td>
                  <span className="text-sm text-slate-700">{v.modalidad}</span>
                </Td>
                <Td>
                  <span className="text-sm text-slate-700">{v.ubicacion}</span>
                </Td>
                <Td>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatMXN(v.sueldo_candidato)}
                  </span>
                  <p className="text-[10px] text-slate-400">mensual bruto</p>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-ink-900">{v.candidatos_activos}</span>
                    <span className="text-xs text-slate-500">activos</span>
                  </div>
                </Td>
                <Td>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_BADGE[v.estatus] || STATUS_BADGE.Abierta}`}>
                    {v.estatus}
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <button className="text-xs font-medium text-brand-600 hover:text-brand-800">
                      Ver pipeline →
                    </button>
                    <ShareLinkButton
                      vacanteId={v.id}
                      vacanteTitulo={v.titulo_puesto}
                    />
                  </div>
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