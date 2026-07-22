'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function passwordStrength(pwd) {
  let score = 0;
  if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Excelente'];
  const colors = [
    'bg-slate-300',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-emerald-600',
  ];
  return { score, label: labels[score] || '', color: colors[score] || 'bg-slate-300' };
}

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre_empresa: '',
    nombre_completo: '',
    correo_corporativo: '',
    password: '',
    confirm_password: '',
    acepta_terminos: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!form.acepta_terminos) {
      setError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_empresa: form.nombre_empresa,
          nombre_completo: form.nombre_completo,
          correo_corporativo: form.correo_corporativo,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo crear la cuenta.');
        return;
      }

      if (data.requiresEmailConfirmation) {
        router.push(data.redirect || '/login?registered=1');
        return;
      }

      router.push(data.redirect || '/dashboard-saas');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800 flex items-start gap-2"
        >
          <svg className="h-5 w-5 flex-none text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
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
          <label htmlFor="nombre_completo" className="block text-sm font-medium text-slate-700">
            Tu nombre completo *
          </label>
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
        </div>

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
            placeholder="ana@tuempresa.com"
            className={`${inputBase} mt-1`}
          />
          <p className="mt-1 text-xs text-slate-500">
            Usa un correo válido de tu organización.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={onChange}
            placeholder="Mínimo 8 caracteres"
            className={`${inputBase} mt-1`}
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Seguridad</span>
                <span className="font-medium">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${strength.color}`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700">
            Confirmar contraseña *
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            value={form.confirm_password}
            onChange={onChange}
            placeholder="Repite la contraseña"
            className={`${inputBase} mt-1`}
          />
          {form.confirm_password && form.password !== form.confirm_password && (
            <p className="mt-1 text-xs text-rose-600">Las contraseñas no coinciden.</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            id="acepta_terminos"
            name="acepta_terminos"
            type="checkbox"
            checked={form.acepta_terminos}
            onChange={onChange}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Acepto los{' '}
            <a href="#" className="font-medium text-brand-600 hover:underline">Términos de Servicio</a>{' '}
            y la{' '}
            <a href="#" className="font-medium text-brand-600 hover:underline">Política de Privacidad</a>.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creando cuenta…' : 'Crear mi cuenta →'}
        </button>
      </form>
    </>
  );
}