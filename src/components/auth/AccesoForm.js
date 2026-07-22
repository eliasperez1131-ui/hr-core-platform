'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isValidTokenFormat } from '@/lib/seguro';

/**
 * AccesoForm — formulario público de login del candidato.
 *
 * Props:
 *   empresaNombre  -> nombre del workspace (mostrado en header)
 *   empresaLogo    -> opcional URL del logo
 *
 * Flujo:
 *   1. Candidato llena teléfono + token.
 *   2. POST /api/auth/candidato
 *   3. Si 200 → guarda en sessionStorage y redirige a /evaluacion/[id]
 *   4. Si 401 → muestra error
 *   5. Si estatus Completada/Cancelada → muestra mensaje
 */
export default function AccesoForm({ empresaNombre = 'HR CORE', empresaLogo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const [form, setForm] = useState({ telefono: '', token_acceso: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.toUpperCase().trim() }));
  };

  const onTelefonoChange = (e) => {
    // Solo dígitos y símbolos telefónicos
    const v = e.target.value.replace(/[^\d\s+\-()]/g, '');
    setForm((f) => ({ ...f, telefono: v }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!form.telefono.trim() || !form.token_acceso.trim()) {
      setError('Completa ambos campos.');
      return;
    }
    if (!isValidTokenFormat(form.token_acceso.toUpperCase().trim())) {
      setError('El token debe tener entre 6 y 8 caracteres (solo mayúsculas y números).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/candidato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono:     form.telefono,
          token_acceso: form.token_acceso,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo validar el acceso.');
        return;
      }

      const c = data.candidato;
      // Guardar credenciales en sessionStorage para que la ruta
      // /evaluacion/[candidato_id] autorice sin pedir login de nuevo.
      try {
        sessionStorage.setItem('candidato_id',            c.id);
        sessionStorage.setItem('candidato_token_acceso',  form.token_acceso);
        sessionStorage.setItem('candidato_nombre',        c.nombre_completo || '');
        sessionStorage.setItem('candidato_ingreso_at',    new Date().toISOString());
      } catch {
        /* sessionStorage no disponible (modo privado extremo) */
      }

      const estatus = c.estatus_reclutamiento || 'Pendiente';

      if (estatus === 'Completada' || estatus === 'Cancelada') {
        setInfo(
          estatus === 'Completada'
            ? '✅ Tu evaluación ya fue completada anteriormente. Puedes cerrar esta ventana.'
            : '⚠️ Tu evaluación fue cancelada. Contacta al reclutador para reagendar.',
        );
        return;
      }

      const destino = next && next.startsWith('/') ? next : `/evaluacion/${c.id}`;
      router.push(destino);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
      {/* Header con branding */}
      <div className="text-center">
        {empresaLogo ? (
          <img src={empresaLogo} alt={empresaNombre} className="mx-auto h-12 w-auto mb-3" />
        ) : (
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-white font-black text-xl mb-3">
            HR
          </div>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          Portal de Evaluación
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {empresaNombre !== 'HR CORE' ? empresaNombre : 'Ingresa con tu teléfono y token de acceso'}
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800 flex items-start gap-2"
        >
          <svg className="h-5 w-5 flex-none text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {info && (
        <div
          role="status"
          className="mt-6 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800"
        >
          {info}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={form.telefono}
            onChange={onTelefonoChange}
            placeholder="+52 55 4422 8831"
            className={`${inputBase} mt-1`}
          />
          <p className="mt-1 text-xs text-slate-500">
            El mismo con el que te postulaste. Puedes incluir o no el código de país.
          </p>
        </div>

        <div>
          <label htmlFor="token_acceso" className="block text-sm font-medium text-slate-700">
            Token de acceso
          </label>
          <input
            id="token_acceso"
            name="token_acceso"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            value={form.token_acceso}
            onChange={onChange}
            placeholder="ABC23DE"
            maxLength={8}
            minLength={6}
            className={`${inputBase} mt-1 font-mono tracking-widest uppercase`}
          />
          <p className="mt-1 text-xs text-slate-500">
            6-8 caracteres en mayúsculas y números (sin O, 0, I, L, 1).
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-5 py-3 text-sm font-bold text-white transition shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando…
            </>
          ) : (
            'Ingresar a mi Evaluación →'
          )}
        </button>
      </form>

      {/* Ayuda */}
      <div className="mt-6 rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
        <p className="font-semibold text-ink-900 mb-1">¿No tienes tu token?</p>
        <p>
          Tu reclutador te lo debió haber enviado por correo o WhatsApp. Si lo perdiste,
          contacta directamente al equipo de RH de la empresa.
        </p>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        ¿Eres reclutador?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Inicia sesión en HR CORE
        </Link>
      </div>
    </div>
  );
}