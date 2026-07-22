'use client';

import { useState } from 'react';

const DIAS_DEFAULT = 7;

/**
 * ShareLinkButton — genera un Magic Link para una vacante y
 * lo copia al portapapeles del reclutador.
 *
 * Props:
 *   vacanteId   -> UUID
 *   vacanteTitulo -> string (mostrado en el modal)
 *   defaultLabel -> string opcional
 */
export default function ShareLinkButton({ vacanteId, vacanteTitulo, defaultLabel }) {
  const [open, setOpen] = useState(false);
  const [dias, setDias] = useState(DIAS_DEFAULT);
  const [label, setLabel] = useState(defaultLabel || 'Enlace para cliente externo');
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    setError('');
    setLink(null);
    setCopied(false);

    try {
      const res = await fetch(`/api/vacantes/${vacanteId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, dias_expiracion: dias }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo generar el enlace.');
        return;
      }
      setLink(data.link);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!link?.url) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + copy
      const el = document.createElement('textarea');
      el.value = link.url;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      document.body.removeChild(el);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        Generar Enlace Mágico
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </span>
                  Generar Enlace Mágico
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {vacanteTitulo ? `Para: ${vacanteTitulo}` : 'Comparte esta vacante con tu cliente.'}
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); setLink(null); setError(''); }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!link ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-slate-700">
                    Etiqueta interna
                  </label>
                  <input
                    id="label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ej. Cliente Acme — ronda final"
                    className={`${inputBase} mt-1`}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor="dias" className="block text-sm font-medium text-slate-700">
                    Días de expiración
                  </label>
                  <select
                    id="dias"
                    value={dias}
                    onChange={(e) => setDias(parseInt(e.target.value, 10))}
                    className={`${inputBase} mt-1`}
                  >
                    <option value={1}>1 día</option>
                    <option value={3}>3 días</option>
                    <option value={7}>7 días (recomendado)</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                    <option value={90}>90 días</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Pasado este plazo, el enlace devolverá error y se podrá regenerar.
                  </p>
                </div>

                {error && (
                  <div role="alert" className="rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onGenerate}
                    disabled={loading}
                    className="inline-flex justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 shadow-glow"
                  >
                    {loading ? 'Generando…' : 'Generar enlace'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
                  <svg className="h-5 w-5 flex-none text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">¡Enlace generado!</p>
                    <p className="text-xs mt-0.5">Expira el {new Date(link.expires_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">URL pública</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={link.url}
                      className={`${inputBase} font-mono text-xs flex-1`}
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={onCopy}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition',
                        copied
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-ink-900 hover:bg-ink-800 text-white',
                      ].join(' ')}
                    >
                      {copied ? (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Copiado
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  🔒 Esta URL muestra <strong>solo</strong> los finalistas marcados como
                  visibles. Los datos personales (correo, teléfono) aparecen enmascarados.
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => { setLink(null); }}
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Generar otro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}