'use client';

import { useState, useEffect } from 'react';
import { formatMXN, formatDateShort } from '@/lib/format';
import PaymentModal from './PaymentModal';

/**
 * FacturacionTab — Tab 3: Facturación Global.
 *
 * Muestra:
 *  - Tarjeta grande con "Inversión total"
 *  - Tabla de facturas pendientes + en revisión
 *  - Tabla de historial de pagos
 *  - Botón "Pagar Ahora" en facturas pendientes → abre PaymentModal
 *
 * Props:
 *   workspaceId -> ID del workspace
 *   facturas    -> array inicial (del Server Component)
 *   resumen     -> { total, pagado, pendiente, en_revision, count }
 */
export default function FacturacionTab({ workspaceId, facturas: initialFacturas, resumen: initialResumen, paidFacturaId, cancelled }) {
  const [facturas, setFacturas] = useState(initialFacturas || []);
  const [resumen, setResumen]   = useState(initialResumen || {});
  const [paying, setPaying]     = useState(null); // factura siendo pagada
  const [info, setInfo]         = useState(
    paidFacturaId
      ? `✅ Pago confirmado. La factura ${paidFacturaId.slice(0, 8)} ha sido marcada como Pagada.`
      : cancelled
        ? 'El pago fue cancelado. Puedes intentarlo de nuevo cuando gustes.'
        : '',
  );

  // Si el callback llega con ?paid=1&factura=xxx&demo=1 → actualizamos estado local
  useEffect(() => {
    if (!paidFacturaId) return;
    const id = paidFacturaId;
    setFacturas((prev) => prev.map((f) =>
      f.id === id
        ? { ...f, estatus: 'Pagada', metodo_pago: 'Tarjeta', fecha_pago: new Date().toISOString() }
        : f,
    ));
    setResumen((r) => ({
      ...r,
      pagado:    r.pagado + (facturas.find((f) => f.id === id)?.monto || 0),
      pendiente: r.pendiente - (facturas.find((f) => f.id === id)?.monto || 0),
      count: {
        ...r.count,
        pagadas:    r.count.pagadas + 1,
        pendientes: Math.max(0, r.count.pendientes - 1),
      },
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidFacturaId]);

  const pendientes   = facturas.filter((f) => f.estatus === 'Pendiente' || f.estatus === 'En_Revision');
  const historial     = facturas.filter((f) => f.estatus === 'Pagada' || f.estatus === 'Cancelada');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-ink-900">Facturación Global</h2>
        <p className="text-sm text-slate-600 mt-1">
          Resumen financiero, facturas pendientes e historial de pagos de tu cuenta.
        </p>
      </div>

      {info && (
        <div
          role="status"
          className={[
            'rounded-md p-3 text-sm',
            paidFacturaId
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800',
          ].join(' ')}
        >
          {info}
        </div>
      )}

      {/* Tarjeta de Inversión Total */}
      <section className="grid sm:grid-cols-3 gap-5">
        <div className="sm:col-span-2 rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white p-6 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-15" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-wider text-brand-300 font-bold">
              Inversión total
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {formatMXN(resumen.total || 0)}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {resumen.count?.total || 0} facturas emitidas · {resumen.count?.pagadas || 0} pagadas
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <Mini label="Pagado"     value={formatMXN(resumen.pagado || 0)}    tone="emerald" />
              <Mini label="Pendiente"  value={formatMXN(resumen.pendiente || 0)} tone="amber" />
              <Mini label="En revisión" value={formatMXN(resumen.en_revision || 0)} tone="sky" />
            </div>
          </div>
        </div>

        {/* Card de acciones rápidas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="text-sm font-bold text-ink-900">Acciones</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Comprobantes fiscales (CFDI)
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Notificaciones por email
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Reportes para tu contabilidad
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Soporte</p>
            <a
              href="/contacto"
              className="mt-1 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-semibold"
            >
              Hablar con un ejecutivo →
            </a>
          </div>
        </div>
      </section>

      {/* Facturas pendientes / en revisión */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b border-amber-200 bg-amber-50 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-900">Facturas pendientes</h3>
            <p className="text-xs text-amber-700">
              {pendientes.length} {pendientes.length === 1 ? 'factura' : 'facturas'} por liquidar
            </p>
          </div>
        </header>
        {pendientes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm font-bold text-emerald-700">¡Sin facturas pendientes!</p>
            <p className="text-xs text-slate-500 mt-1">Todas tus facturas están al día.</p>
          </div>
        ) : (
          <ul className="divide-y divide-amber-100">
            {pendientes.map((f) => (
              <FacturaRow
                key={f.id}
                factura={f}
                onPagar={() => setPaying(f)}
                tone="amber"
              />
            ))}
          </ul>
        )}
      </section>

      {/* Historial */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-ink-900">Historial de pagos</h3>
            <p className="text-xs text-slate-500">
              {historial.length} {historial.length === 1 ? 'factura' : 'facturas'} procesadas
            </p>
          </div>
        </header>
        {historial.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aún no tienes pagos registrados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {historial.map((f) => (
              <FacturaRow key={f.id} factura={f} tone="slate" />
            ))}
          </ul>
        )}
      </section>

      {/* Modal de pago */}
      <PaymentModal
        factura={paying}
        open={!!paying}
        onClose={() => setPaying(null)}
        onSuccess={(f) => {
          setFacturas((prev) => prev.map((x) => (x.id === f.id ? f : x)));
          setResumen((r) => {
            const old = facturas.find((x) => x.id === f.id);
            if (!old) return r;
            return {
              ...r,
              pendiente:   r.pendiente   - old.monto,
              en_revision: r.en_revision - old.monto,
              pagado:      r.pagado      + old.monto,
              count: {
                ...r.count,
                pendientes:  Math.max(0, r.count.pendientes - 1),
                en_revision: Math.max(0, r.count.en_revision - 1),
                pagadas:     r.count.pagadas + 1,
              },
            };
          });
        }}
      />
    </div>
  );
}

function Mini({ label, value, tone }) {
  const tones = {
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20',
    amber:   'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20',
    sky:     'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20',
  };
  return (
    <div className={`rounded-lg px-2.5 py-1.5 ${tones[tone] || tones.slate}`}>
      <p className="text-[9px] uppercase tracking-wider font-bold opacity-80">{label}</p>
      <p className="text-sm font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function FacturaRow({ factura, onPagar, tone }) {
  const estatus = factura.estatus;
  const badgeEstilos = {
    Pagada:      'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Pendiente:   'bg-amber-100 text-amber-700 ring-amber-200',
    En_Revision: 'bg-sky-100 text-sky-700 ring-sky-200',
    Cancelada:   'bg-slate-100 text-slate-600 ring-slate-200',
  };
  return (
    <li className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-ink-900">
            Factura #{factura.id.slice(0, 8).toUpperCase()}
          </p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${badgeEstilos[estatus]}`}>
            {estatus.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-0.5">{factura.descripcion}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Emitida: {formatDateShort(factura.created_at)}
          {factura.fecha_pago && ` · Pagada: ${formatDateShort(factura.fecha_pago)}`}
          {factura.metodo_pago && ` · ${factura.metodo_pago}`}
        </p>
      </div>

      <div className="text-right flex items-center gap-4">
        <div>
          <p className="text-lg font-extrabold text-ink-900 tabular-nums">
            {formatMXN(factura.monto)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {factura.moneda}
          </p>
        </div>
        {(estatus === 'Pendiente' || estatus === 'En_Revision') && onPagar && (
          <button
            type="button"
            onClick={onPagar}
            className="inline-flex items-center rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 transition shadow"
          >
            Pagar ahora →
          </button>
        )}
      </div>
    </li>
  );
}