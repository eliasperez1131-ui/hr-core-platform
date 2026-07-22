'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMXN } from '@/lib/format';

/**
 * GenerarCobroButton — Botón en vacantes CERRADAS del dashboard SaaS.
 *
 * Toma el `cobro_cliente` de la vacante y crea una factura.
 * Al éxito, redirige al Portal Cliente en tab Facturación.
 *
 * Props:
 *   vacanteId, cobroCliente, titulo, vacanteNombre
 */
export default function GenerarCobroButton({ vacanteId, cobroCliente, titulo, vacanteNombre }) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(null);

  if (!cobroCliente || Number(cobroCliente) <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold px-2 py-1">
        Sin cobro configurado
      </span>
    );
  }

  const onGenerar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'ws-hr-core-demo', // demo
          vacante_id:   vacanteId,
          monto:        Number(cobroCliente),
          descripcion:  `Headhunting · ${vacanteNombre || titulo}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo generar el cobro.');
        return;
      }
      setSuccess(data.factura);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 transition shadow"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Generar Cobro al Cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-700 to-teal-600 text-white">
              <h3 className="text-lg font-bold">Generar Cobro al Cliente</h3>
              <p className="text-xs text-emerald-100">
                {vacanteNombre || titulo}
              </p>
            </header>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Monto a cobrar
                </p>
                <p className="mt-1 text-4xl font-extrabold text-ink-900 tabular-nums">
                  {formatMXN(cobroCliente)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  (cobro_cliente de la vacante)
                </p>
              </div>

              {error && (
                <div role="alert" className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
                  {error}
                </div>
              )}

              {success ? (
                <>
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                    ✅ Factura creada: <code className="font-mono">{success.id.slice(0, 8)}</code>
                    <br />
                    Estatus: <strong>Pendiente</strong> · El cliente ya puede verla en su portal.
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/portal-cliente?tab=facturacion')}
                    className="w-full inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2.5 transition"
                  >
                    Ver en Portal Cliente →
                  </button>
                </>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onGenerar}
                    disabled={loading}
                    className="inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 transition disabled:opacity-60"
                  >
                    {loading ? 'Creando…' : 'Crear factura'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}