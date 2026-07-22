'use client';

import { useState } from 'react';
import VincularCandidatoModal from './VincularCandidatoModal';

/**
 * RegistrarCandidatoFlow — flujo completo de "registrar candidato a una vacante":
 *
 * 1. El reclutador llena el formulario (nombre, correo, teléfono, etc.).
 * 2. Al perder foco en email o teléfono, busca en la BD.
 * 3. Si NO existe → submit normal → POST /api/candidatos + POST /api/vacante-candidatos.
 * 4. Si SÍ existe → abre el VincularCandidatoModal con historial.
 *    - Cancelar → cierra el modal sin hacer nada.
 *    - Confirmar → POST /api/vacante-candidatos con el candidato existente.
 *
 * Props:
 *   vacanteId    -> UUID de la vacante a la que se va a vincular
 *   demoMode     -> boolean (true = usa mocks de candidatos-mock.js)
 *   onSuccess    -> callback opcional tras éxito
 */
export default function RegistrarCandidatoFlow({
  vacanteId,
  demoMode = true,
  onSuccess,
}) {
  const [form, setForm] = useState({
    nombre_completo: '',
    correo: '',
    telefono: '',
    edad: '',
    escolaridad: '',
    estado: '',
    municipio: '',
    consentimiento_red: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenGenerado, setTokenGenerado] = useState(''); // token_acceso devuelto por el backend
  const [existing, setExisting] = useState(null); // { candidato, historial } | null
  const [modalOpen, setModalOpen] = useState(false);
  const [vinculando, setVinculando] = useState(false);
  const [touched, setTouched] = useState({ correo: false, telefono: false });

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Buscar duplicados al perder foco
  const onBlur = async (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field !== 'correo' && field !== 'telefono') return;
    const email    = (field === 'correo'    ? form.correo   : form.correo).trim();
    const telefono = (field === 'telefono' ? form.telefono : form.telefono).trim();
    if (!email && !telefono) return;

    setSearching(true);
    try {
      const qs = new URLSearchParams();
      if (email)    qs.set('email',    email);
      if (telefono) qs.set('telefono', telefono);
      if (demoMode) qs.set('demo', '1');

      const res = await fetch(`/api/candidatos/buscar?${qs}`);
      const data = await res.json();

      if (data.ok && data.found) {
        setExisting({ candidato: data.candidato, historial: data.historial || [] });
        setModalOpen(true);
      }
    } catch {
      /* continuar sin bloquear */
    } finally {
      setSearching(false);
    }
  };

  // Vincular al candidato existente
  const onVincularExistente = async () => {
    if (!existing?.candidato?.id) return;
    setVinculando(true);
    setError('');
    try {
      const res = await fetch('/api/vacante-candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidato_id: existing.candidato.id,
          vacante_id:   vacanteId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.duplicate) {
          setError('Este candidato ya estaba vinculado a esta vacante.');
        } else {
          setError(data.error || 'No se pudo vincular.');
        }
        return;
      }
      setSuccess(data.message || 'Candidato vinculado exitosamente.');
      setModalOpen(false);
      setExisting(null);
      onSuccess?.(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setVinculando(false);
    }
  };

  // Submit normal (candidato nuevo)
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nombre_completo.trim() || !form.correo.trim() || !form.telefono.trim()) {
      setError('Completa nombre, correo y teléfono.');
      return;
    }
    if (!form.consentimiento_red) {
      setError('Se requiere consentimiento del candidato para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        edad: form.edad ? parseInt(form.edad, 10) : null,
      };
      if (demoMode) payload.demo = 1;

      const resC = await fetch('/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const dataC = await resC.json();

      if (resC.status === 409 && dataC.duplicate) {
        // Defensa adicional: el backend detectó duplicado.
        const resB = await fetch(`/api/candidatos/buscar?correo=${encodeURIComponent(form.correo)}&telefono=${encodeURIComponent(form.telefono)}${demoMode ? '&demo=1' : ''}`);
        const dataB = await resB.json();
        if (dataB.ok && dataB.found) {
          setExisting({ candidato: dataB.candidato, historial: dataB.historial || [] });
          setModalOpen(true);
          return;
        }
      }

      if (!resC.ok || !dataC.ok) {
        setError(dataC.error || 'No se pudo registrar el candidato.');
        return;
      }

      // Capturar el token_acceso generado por el backend para mostrarlo al reclutador
      const tokenGenerado = dataC.candidato?.token_acceso;
      if (tokenGenerado) setTokenGenerado(tokenGenerado);

      // Vincular a la vacante
      const resV = await fetch('/api/vacante-candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidato_id: dataC.candidato.id,
          vacante_id:   vacanteId,
        }),
      });
      const dataV = await resV.json();
      if (!resV.ok || !dataV.ok) {
        setError(dataV.error || 'Candidato creado pero no se pudo vincular.');
        return;
      }

      setSuccess(dataV.message || 'Candidato registrado y vinculado a la vacante.');
      setForm({
        nombre_completo: '',
        correo: '',
        telefono: '',
        edad: '',
        escolaridad: '',
        estado: '',
        municipio: '',
        consentimiento_red: false,
      });
      onSuccess?.(dataV);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div role="alert" className="mb-5 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-5 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {tokenGenerado && (
        <TokenGeneradoPanel
          token={tokenGenerado}
          candidatoNombre={form.nombre_completo}
          telefono={form.telefono}
          onClose={() => setTokenGenerado('')}
        />
      )}
      {searching && (
        <div className="mb-3 text-xs text-slate-500 inline-flex items-center gap-1.5">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verificando duplicados...
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nombre completo *" htmlFor="nombre_completo">
            <input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              required
              value={form.nombre_completo}
              onChange={onChange}
              placeholder="Ana Reyes Hernández"
              className={`${inputBase} mt-1`}
            />
          </Field>
          <Field label="Edad" htmlFor="edad">
            <input
              id="edad"
              name="edad"
              type="number"
              min="14"
              max="100"
              value={form.edad}
              onChange={onChange}
              placeholder="28"
              className={`${inputBase} mt-1`}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Correo electrónico *"
            htmlFor="correo"
            hint="Si ya existe, abriremos su historial."
          >
            <input
              id="correo"
              name="correo"
              type="email"
              required
              value={form.correo}
              onChange={onChange}
              onBlur={() => onBlur('correo')}
              placeholder="ana.reyes@gmail.com"
              className={`${inputBase} mt-1 ${touched.correo ? '' : ''}`}
            />
          </Field>
          <Field
            label="Teléfono *"
            htmlFor="telefono"
            hint="Validamos también por número."
          >
            <input
              id="telefono"
              name="telefono"
              type="tel"
              required
              value={form.telefono}
              onChange={onChange}
              onBlur={() => onBlur('telefono')}
              placeholder="+52 55 4422 8831"
              className={`${inputBase} mt-1`}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <Field label="Escolaridad" htmlFor="escolaridad">
            <select
              id="escolaridad"
              name="escolaridad"
              value={form.escolaridad}
              onChange={onChange}
              className={`${inputBase} mt-1`}
            >
              <option value="">— Seleccionar —</option>
              <option>Secundaria</option>
              <option>Preparatoria / Bachillerato</option>
              <option>Técnico</option>
              <option>Licenciatura</option>
              <option>Maestría</option>
              <option>Doctorado</option>
            </select>
          </Field>
          <Field label="Estado" htmlFor="estado">
            <input
              id="estado"
              name="estado"
              type="text"
              value={form.estado}
              onChange={onChange}
              placeholder="CDMX"
              className={`${inputBase} mt-1`}
            />
          </Field>
          <Field label="Municipio / Alcaldía" htmlFor="municipio">
            <input
              id="municipio"
              name="municipio"
              type="text"
              value={form.municipio}
              onChange={onChange}
              placeholder="Iztapalapa"
              className={`${inputBase} mt-1`}
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            id="consentimiento_red"
            name="consentimiento_red"
            type="checkbox"
            checked={form.consentimiento_red}
            onChange={onChange}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            El candidato autoriza el tratamiento de sus datos para fines de reclutamiento
            (LFPDPPP México / RGPD).
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-glow disabled:opacity-60"
          >
            {submitting ? 'Registrando…' : 'Registrar y vincular'}
          </button>
        </div>
      </form>

      <VincularCandidatoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setExisting(null); }}
        candidato={existing?.candidato}
        historial={existing?.historial}
        onConfirm={onVincularExistente}
        loading={vinculando}
      />
    </>
  );
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ============================================================
 *  TokenGeneradoPanel — muestra el token_acceso generado al
 *  reclutador para que lo entregue al candidato.
 * ============================================================ */
function TokenGeneradoPanel({ token, candidatoNombre, telefono, onClose }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = token;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      document.body.removeChild(el);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const linkAcceso = typeof window !== 'undefined'
    ? `${window.location.origin}/acceso-evaluacion`
    : '/acceso-evaluacion';

  return (
    <div className="mb-5 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex-none rounded-full bg-emerald-500 text-white grid place-items-center text-xl">
            ✓
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">
              Candidato creado — Token generado
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Entrega este código al candidato por WhatsApp o correo para que pueda
              acceder a su evaluación.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-emerald-700 hover:text-emerald-900"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="rounded-md bg-white border border-emerald-200 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Candidato
          </p>
          <p className="text-sm font-bold text-ink-900 mt-0.5 truncate">
            {candidatoNombre || '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{telefono || '—'}</p>
        </div>

        <div className="rounded-md bg-white border-2 border-emerald-300 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Token de acceso
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 font-mono text-2xl font-extrabold tracking-widest text-emerald-700">
              {token}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className={[
                'rounded-md px-2.5 py-1.5 text-xs font-bold transition',
                copied
                  ? 'bg-emerald-200 text-emerald-800'
                  : 'bg-ink-900 text-white hover:bg-ink-800',
              ].join(' ')}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-ink-900 text-emerald-300 p-3 text-xs font-mono">
        {linkAcceso} → Tel + Token
      </div>

      <p className="mt-3 text-[11px] text-emerald-800">
        💡 El candidato entra a <strong>{linkAcceso}</strong>, escribe su teléfono
        y este token, y accede a la evaluación. Las letras O, I, L y los números 0, 1
        se excluyen del token para evitar errores de captura.
      </p>
    </div>
  );
}