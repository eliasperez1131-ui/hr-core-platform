import { formatMXN, formatMXNWithCents } from '@/lib/format';
import DelicadaBadge from './DelicadaBadge';

/**
 * FinancialProjectionWidget — tarjeta de "Proyección Financiera"
 * visible SOLO para Super_Admin en el dashboard.
 *
 * Suma:
 *   - Comisiones de candidatos contratados (este mes)
 *   - Facturación al cliente por esos mismos candidatos
 *
 * Muestra además un desglose por vacante y la lista de vacantes
 * activas con su badge de delicadas si aplica.
 *
 * En producción estos totales vienen de una query SQL como:
 *
 *   SELECT v.id, v.titulo_puesto, v.es_delicada,
 *          COUNT(*) FILTER (WHERE vc.estatus = 'Contratado') AS contratados,
 *          SUM(v.comision_freelance) AS comision_total,
 *          SUM(v.cobro_cliente)      AS facturacion_total
 *   FROM vacantes v
 *   LEFT JOIN vacante_candidatos vc ON vc.vacante_id = v.id
 *   WHERE v.workspace_id = $1
 *   GROUP BY v.id
 *   ORDER BY comision_total DESC NULLS LAST;
 */
export default function FinancialProjectionWidget({ data, vacantes = [] }) {
  const d = data;
  if (!d) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header con badge de privacidad */}
      <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-ink-900 to-ink-800 text-white flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
              🔒 SOLO SUPER ADMIN
            </span>
            <h3 className="text-sm font-bold">Proyección Financiera</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {d.mes_actual} · Candidatos con estatus <strong className="text-white">Contratado</strong>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Margen total</p>
          <p className="text-2xl font-extrabold text-emerald-300">
            {formatMXN(d.total_facturacion_mes - d.total_comisiones_mes)}
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
        <Kpi
          label="Contratados"
          value={d.total_contratados_mes}
          hint="este mes"
          tone="brand"
        />
        <Kpi
          label="Comisiones a pagar"
          value={formatMXN(d.total_comisiones_mes)}
          hint="Σ freelance"
          tone="amber"
        />
        <Kpi
          label="Facturación"
          value={formatMXN(d.total_facturacion_mes)}
          hint="Σ cliente"
          tone="emerald"
        />
        <Kpi
          label="Comisión promedio"
          value={formatMXN(d.comision_por_contratado)}
          hint="por candidato"
          tone="slate"
        />
      </div>

      {/* Desglose por vacante */}
      <div className="px-6 py-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Desglose por vacante
        </h4>
        <ul className="divide-y divide-slate-100">
          {d.por_vacante.map((v) => {
            const vacanteFull = vacantes.find((x) => x.id === v.id);
            return (
              <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-start gap-2">
                  {vacanteFull?.es_delicada && (
                    <span className="mt-0.5 flex-none">
                      <DelicadaBadge size="sm" withLabel={false} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{v.titulo}</p>
                    <p className="text-xs text-slate-500">
                      {v.contratados} {v.contratados === 1 ? 'contratado' : 'contratados'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-none">
                  <p className="text-sm font-bold text-emerald-700">
                    {formatMXNWithCents(v.facturacion_total)}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    − {formatMXN(v.comision_total)} comision
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer informativo */}
      <footer className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
        🔒 Esta información es estrictamente confidencial. Reclutadores freelance y
        administradores de agencia <strong>no tienen acceso</strong> a estos montos.
      </footer>
    </section>
  );
}

function Kpi({ label, value, hint, tone = 'slate' }) {
  const tones = {
    brand:   'text-brand-700',
    amber:   'text-amber-700',
    emerald: 'text-emerald-700',
    slate:   'text-ink-900',
  };
  return (
    <div className="px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-extrabold ${tones[tone] || tones.slate}`}>{value}</p>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}