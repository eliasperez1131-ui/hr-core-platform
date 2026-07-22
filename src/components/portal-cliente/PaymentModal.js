'use client';

import { useState } from 'react';
import { formatMXN } from '@/lib/format';
import { DEMO_DATOS_BANCARIOS } from '@/lib/facturas-data';

/**
 * PaymentModal — Modal de pago con 2 opciones:
 *
 * 1. 💳 Tarjeta (Stripe Checkout):
 *    Llama a /api/facturas/[id]/checkout → recibe URL de Stripe
 *    y redirige. Si no hay Stripe configurado, entra en MODO DEMO
 *    que actualiza el estado via el callback.
 *
 * 2. 🏦 Transferencia bancaria:
 *    Muestra los datos del banco, pide una referencia y llama a
 *    /api/facturas/[id]/confirmar-transferencia → cambia el estatus
 *    a En_Revision para que el Super_Admin apruebe.
 *
 * Props:
 *   factura       -> objeto factura
 *   open          -> boolean
 *   onClose       -> () => void
 *   onSuccess     -> (facturaActualizada) => void
 */
export default function PaymentModal({ factura, open, onClose, onSuccess }) {
  const [metodo, setMetodo] = useState(null);   // 'tarjeta' | 'transferencia' | null
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [referencia, setReferencia] = useState('');
  const [datos, setDatos]     = useState(null);   // respuesta del checkout

  if (!open || !factura) return null;

  const reset = () => {
    setMetodo(null);
    setLoading(false);
    setError('');
    setReferencia('');
    setDatos(null);
  };

  const handleClose = () => { reset(); onClose?.(); };

  const handleTarjeta = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/facturas/${factura.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo iniciar el checkout.');
        setLoading(false);
        return;
      }
      // Redirigir al checkout (real o demo)
      window.location.href = data.url;
    } catch {
      setError('No se pudo conectar con el servidor.');
      setLoading(false);
    }
  };

  const handleTransferencia = async () => {
    if (!referencia.trim()) {
      setError('Ingresa la referencia de tu transferencia.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/facturas/${factura.id}/confirmar-transferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referencia: referencia.trim(), notas: '' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo registrar la transferencia.');
        setLoading(false);
        return;
      }
      onSuccess?.(data.factura);
      handleClose();
    } catch {
      setError('No se pudo conectar con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-ink-900 to-ink-800 text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-brand-300">Pago de factura</p>
            <h3 className="text-lg font-bold">Factura #{factura.id.slice(0, 8)}</h3>
            <p className="text-2xl font-extrabold mt-1">{formatMXN(factura.monto)} <span className="text-sm text-slate-300">{factura.moneda}</span></p>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white" aria-label="Cerrar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Error banner */}
        {error && (
          <div role="alert" className="mx-6 mt-4 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {/* Step 1 — elegir método */}
        {!metodo && (
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMetodo('tarjeta')}
              className="group rounded-xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50 p-5 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-brand-100 text-brand-700 grid place-items-center text-xl">
                  💳
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">Tarjeta de crédito/débito</p>
                  <p className="text-xs text-slate-500">Stripe · Visa, Mastercard, Amex</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Procesamiento inmediato. Actualización automática al recibir el pago.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMetodo('transferencia')}
              className="group rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 p-5 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center text-xl">
                  🏦
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">Transferencia bancaria</p>
                  <p className="text-xs text-slate-500">SPEI · CLABE interbancaria</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Tu pago se marca como "En Revisión" y se confirma al recibir la transferencia.
              </p>
            </button>
          </div>
        )}

        {/* Step 2a — Tarjeta */}
        {metodo === 'tarjeta' && (
          <div className="p-6 space-y-4">
            <button onClick={() => setMetodo(null)} className="text-xs text-slate-500 hover:text-slate-700">
              ← Cambiar método
            </button>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-ink-900">Pago con Stripe Checkout</p>
              <p className="text-xs text-slate-600 mt-1">
                Al hacer clic serás redirigido a la página segura de Stripe
                para ingresar los datos de tu tarjeta. El recibo se enviará a tu correo.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Cifrado TLS · PCI-DSS Nivel 1
              </div>
            </div>

            <button
              type="button"
              onClick={handleTarjeta}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-3 transition shadow-glow disabled:opacity-60"
            >
              {loading ? 'Conectando con Stripe…' : `Pagar ${formatMXN(factura.monto)} con tarjeta →`}
            </button>
          </div>
        )}

        {/* Step 2b — Transferencia */}
        {metodo === 'transferencia' && (
          <div className="p-6 space-y-4">
            <button onClick={() => setMetodo(null)} className="text-xs text-slate-500 hover:text-slate-700">
              ← Cambiar método
            </button>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                Datos para transferencia SPEI
              </p>
              <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Banco:</span> <strong>{DEMO_DATOS_BANCARIOS.banco}</strong></div>
                <div><span className="text-slate-500">Titular:</span> <strong>{DEMO_DATOS_BANCARIOS.titular}</strong></div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">CLABE:</span>{' '}
                  <code className="font-mono text-base font-bold tracking-wider text-emerald-800">{DEMO_DATOS_BANCARIOS.clabe}</code>
                </div>
                <div><span className="text-slate-500">Cuenta:</span> <code className="font-mono">{DEMO_DATOS_BANCARIOS.cuenta}</code></div>
                <div><span className="text-slate-500">SWIFT:</span> <code className="font-mono">{DEMO_DATOS_BANCARIOS.swift}</code></div>
              </div>
              <p className="mt-3 text-xs text-emerald-900">
                💡 Una vez realizada la transferencia, ingresa la referencia abajo
                para que nuestro equipo la verifique.
              </p>
            </div>

            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-slate-700">
                Referencia / número de operación *
              </label>
              <input
                id="ref"
                type="text"
                required
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. 01234567890"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleTransferencia}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 transition shadow disabled:opacity-60"
            >
              {loading ? 'Registrando…' : 'Ya transferí — Marcar como En Revisión'}
            </button>
          </div>
        )}

        {/* Footer con descripción */}
        <footer className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
          {factura.descripcion || 'Servicio de Headhunting HR CORE'}
        </footer>
      </div>
    </div>
  );
}