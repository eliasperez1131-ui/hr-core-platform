'use client';

import { useState } from 'react';

const INTERESES = [
  { value: 'SaaS',      label: 'SaaS para mi empresa' },
  { value: 'Freelance', label: 'Quiero reclutar como Freelance' },
  { value: 'Ambos',     label: 'Ambos modelos' },
];

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre_empresa: '',
    nombre_contacto: '',
    correo_corporativo: '',
    telefono: '',
    interes: 'Ambos',
    mensaje: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ state: 'loading', message: '' });

    try {
      const res = await fetch('/api/prospectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus({ state: 'error', message: data.error || 'Error desconocido.' });
        return;
      }

      setStatus({
        state: 'success',
        message: '¡Gracias! Un ejecutivo te contactará en menos de 24 hrs hábiles.',
      });
      setForm({
        nombre_empresa: '',
        nombre_contacto: '',
        correo_corporativo: '',
        telefono: '',
        interes: 'Ambos',
        mensaje: '',
      });
    } catch (err) {
      setStatus({ state: 'error', message: 'No se pudo enviar el formulario. Intenta más tarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre_empresa" className="block text-sm font-medium text-slate-700">
            Nombre de la empresa *
          </label>
          <input
            id="nombre_empresa"
            name="nombre_empresa"
            type="text"
            required
            value={form.nombre_empresa}
            onChange={onChange}
            placeholder="Seguridad Privada del Norte S.A."
            className={`${inputBase} mt-1`}
          />
        </div>
        <div>
          <label htmlFor="nombre_contacto" className="block text-sm font-medium text-slate-700">
            Nombre del contacto *
          </label>
          <input
            id="nombre_contacto"
            name="nombre_contacto"
            type="text"
            required
            value={form.nombre_contacto}
            onChange={onChange}
            placeholder="Ana Reyes"
            className={`${inputBase} mt-1`}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="correo_corporativo" className="block text-sm font-medium text-slate-700">
            Correo corporativo *
          </label>
          <input
            id="correo_corporativo"
            name="correo_corporativo"
            type="email"
            required
            value={form.correo_corporativo}
            onChange={onChange}
            placeholder="ana@empresa.com"
            className={`${inputBase} mt-1`}
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">
            Teléfono *
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            value={form.telefono}
            onChange={onChange}
            placeholder="+52 55 1234 5678"
            className={`${inputBase} mt-1`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Interés principal</label>
        <div className="mt-2 grid sm:grid-cols-3 gap-3">
          {INTERESES.map((op) => (
            <label
              key={op.value}
              className={[
                'flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition',
                form.interes === op.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300',
              ].join(' ')}
            >
              <input
                type="radio"
                name="interes"
                value={op.value}
                checked={form.interes === op.value}
                onChange={onChange}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm">{op.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-slate-700">
          Cuéntanos brevemente tu reto (opcional)
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          value={form.mensaje}
          onChange={onChange}
          placeholder="¿Cuántas vacantes manejas al mes? ¿Qué industria?"
          className={`${inputBase} mt-1`}
          maxLength={1000}
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          Al enviar aceptas nuestra política de privacidad. Tus datos solo se usan para
          contactarte comercialmente.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
        >
          {submitting ? 'Enviando…' : 'Enviar solicitud →'}
        </button>
      </div>

      {status.state === 'success' && (
        <div
          role="status"
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800"
        >
          {status.message}
        </div>
      )}
      {status.state === 'error' && (
        <div
          role="alert"
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800"
        >
          {status.message}
        </div>
      )}
    </form>
  );
}