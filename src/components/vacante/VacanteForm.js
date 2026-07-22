'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GIROS_FORM,
  OPCION_OTRO,
  getJornadaSugerida,
  getOpcionesTurno,
  getGiroMeta,
} from '@/lib/turnos';
import {
  COORDINADORES_DEMO,
  MODALIDADES,
} from '@/lib/dashboard-data';

/**
 * VacanteForm — formulario avanzado con:
 *   - Selector inteligente de turnos según Giro
 *   - Toggle "Vacante Delicada" (bloquea automatización)
 *   - Sección financiera SOLO visible para Super_Admin
 *
 * Props:
 *   rolCreador  -> 'Super_Admin' | 'Administrador_Agencia' | 'Coordinador'
 *                  controla si se muestran los campos financieros.
 *   workspaceId -> UUID del workspace donde se crea la vacante.
 */
export default function VacanteForm({ rolCreador = 'Super_Admin', workspaceId }) {
  const router = useRouter();

  // 🔒 PRIVACIDAD FINANCIERA — SOLO Super_Admin ve y edita los campos de dinero.
  // Para Administrador_Agencia y Coordinador, la sección COMPLETA desaparece del DOM.
  const puedeVerFinanzas = rolCreador === 'Super_Admin';

  const [giro, setGiro] = useState('Seguridad_Privada');
  const [detalleTurno, setDetalleTurno] = useState('');
  const [otroTurno, setOtroTurno] = useState('');
  const [esDelicada, setEsDelicada] = useState(false);

  const giroMeta      = useMemo(() => getGiroMeta(giro), [giro]);
  const opcionesTurno = useMemo(() => getOpcionesTurno(giro), [giro]);

  const [form, setForm] = useState({
    titulo_puesto: '',
    descripcion: '',
    requisitos: '',
    beneficios: '',
    tipo_jornada: getJornadaSugerida('Seguridad_Privada').tipo_jornada,
    modalidad: 'Presencial',
    ubicacion: '',
    sueldo_candidato: '',
    cobro_cliente: '',
    comision_freelance: '',
    asignado_a_coordinador_id: '',
    vacantes_disponibles: 1,
    estatus: 'Abierta',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const requiereInputLibre =
    detalleTurno === OPCION_OTRO || detalleTurno === 'Personalizado';

  // Cuando cambia el giro, preseleccionamos la primera opción.
  // Si es "Otro" / "Personalizado", limpiamos el detalle (lo llenará el input libre).
  useEffect(() => {
    const sug = getJornadaSugerida(giro);
    const esCustom = sug.detalle_turno === OPCION_OTRO || sug.detalle_turno === 'Personalizado';
    setDetalleTurno(esCustom ? '' : sug.detalle_turno);
    setOtroTurno('');
    setForm((f) => ({ ...f, tipo_jornada: sug.tipo_jornada }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giro]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onGiroChange = (e) => {
    const value = e.target.value;
    setGiro(value);
    const sug = getJornadaSugerida(value);
    setForm((f) => ({ ...f, tipo_jornada: sug.tipo_jornada }));
  };

  const onTurnoChange = (e) => {
    const value = e.target.value;
    setDetalleTurno(value);
    if (value !== OPCION_OTRO && value !== 'Personalizado') setOtroTurno('');

    // sincronizar tipo_jornada según la opción elegida
    const opt = opcionesTurno.find((o) => o.value === value);
    if (opt) setForm((f) => ({ ...f, tipo_jornada: opt.tipo }));
  };

  const detalleFinal = requiereInputLibre ? otroTurno : detalleTurno;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo_puesto.trim()) {
      setStatus({ state: 'error', message: 'El título del puesto es obligatorio.' });
      return;
    }
    if (!detalleFinal.trim()) {
      setStatus({ state: 'error', message: 'Define el detalle del turno.' });
      return;
    }

    setSubmitting(true);
    setStatus({ state: 'loading', message: '' });

    const payload = {
      ...form,
      detalle_turno: detalleFinal,
      workspace_id: workspaceId,
      es_delicada: esDelicada,
      sueldo_candidato:      form.sueldo_candidato      ? Number(form.sueldo_candidato)      : null,
      cobro_cliente:         puedeVerFinanzas && form.cobro_cliente         ? Number(form.cobro_cliente)         : null,
      comision_freelance:    puedeVerFinanzas && form.comision_freelance    ? Number(form.comision_freelance)    : null,
      vacantes_disponibles:  Number(form.vacantes_disponibles) || 1,
      asignado_a_coordinador_id: form.asignado_a_coordinador_id || null,
    };

    try {
      const res = await fetch('/api/vacantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ state: 'error', message: data.error || 'Error al crear la vacante.' });
        return;
      }
      setStatus({ state: 'success', message: `Vacante "${data.titulo}" creada correctamente.` });
      setTimeout(() => router.push('/dashboard-saas'), 1200);
    } catch {
      setStatus({ state: 'error', message: 'No se pudo conectar con el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* ============ SECCIÓN 1: INFORMACIÓN BÁSICA ============ */}
      <Section
        n="01"
        titulo="Información del puesto"
        desc="Título, descripción y requisitos visibles para el candidato."
      >
        <Field label="Título del puesto *" htmlFor="titulo_puesto">
          <input
            id="titulo_puesto"
            name="titulo_puesto"
            required
            value={form.titulo_puesto}
            onChange={onChange}
            placeholder="Ej. Guardia de Seguridad Intramuros"
            className={inputBase}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Descripción" htmlFor="descripcion">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              value={form.descripcion}
              onChange={onChange}
              placeholder="Funciones principales del puesto…"
              className={inputBase}
            />
          </Field>
          <Field label="Requisitos" htmlFor="requisitos">
            <textarea
              id="requisitos"
              name="requisitos"
              rows={4}
              value={form.requisitos}
              onChange={onChange}
              placeholder="Escolaridad, experiencia, certificaciones…"
              className={inputBase}
            />
          </Field>
        </div>

        <Field label="Beneficios" htmlFor="beneficios">
          <textarea
            id="beneficios"
            name="beneficios"
            rows={2}
            value={form.beneficios}
            onChange={onChange}
            placeholder="Prestaciones, bonos, vales, etc."
            className={inputBase}
          />
        </Field>
      </Section>

      {/* ============ SECCIÓN 2: GIRO + TURNOS INTELIGENTES ============ */}
      <Section
        n="02"
        titulo="Operación y turnos"
        desc="Selecciona el giro: el sistema sugerirá los turnos típicos de tu industria."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Giro industrial *" htmlFor="giro">
            <select id="giro" name="giro" value={giro} onChange={onGiroChange} className={inputBase}>
              {GIROS_FORM.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de jornada" htmlFor="tipo_jornada">
            <select
              id="tipo_jornada"
              name="tipo_jornada"
              value={form.tipo_jornada}
              onChange={onChange}
              className={inputBase}
            >
              <option value="Fijo">Fijo</option>
              <option value="Rolado">Rolado</option>
              <option value="Ciclico">Cíclico</option>
            </select>
          </Field>
        </div>

        {/* Banner informativo del giro seleccionado */}
        <div className="rounded-lg bg-brand-50 border border-brand-100 p-4 flex gap-3">
          <div className="h-9 w-9 flex-none rounded-full bg-brand-100 text-brand-700 grid place-items-center">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-900">
              {giroMeta.label} — turnos disponibles
            </p>
            <p className="text-xs text-brand-800 mt-0.5">{giroMeta.descripcion}</p>
          </div>
        </div>

        <Field label="Detalle de turno *" htmlFor="detalle_turno">
          <select
            id="detalle_turno"
            name="detalle_turno"
            value={detalleTurno}
            onChange={onTurnoChange}
            className={inputBase}
          >
            <option value="" disabled>— Selecciona una opción —</option>
            {opcionesTurno.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value} {opt.tipo !== 'Otro' && opt.tipo !== 'Fijo' ? `· ${opt.tipo}` : ''}
              </option>
            ))}
          </select>
        </Field>

        {requiereInputLibre && (
          <Field label="Especificar ciclo personalizado *" htmlFor="otroTurno" hint="Describe el horario o ciclo que no aparece en la lista.">
            <input
              id="otroTurno"
              type="text"
              value={otroTurno}
              onChange={(e) => setOtroTurno(e.target.value)}
              placeholder="Ej. Lunes a Viernes 7:00-16:00 con 1 sábado al mes, o 4x4 con horario 22:00-06:00"
              className={inputBase}
              required
            />
          </Field>
        )}

        <div className="grid sm:grid-cols-3 gap-5">
          <Field label="Modalidad" htmlFor="modalidad">
            <select id="modalidad" name="modalidad" value={form.modalidad} onChange={onChange} className={inputBase}>
              {MODALIDADES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación" htmlFor="ubicacion">
            <input
              id="ubicacion"
              name="ubicacion"
              value={form.ubicacion}
              onChange={onChange}
              placeholder="Ej. Santa Fe, CDMX"
              className={inputBase}
            />
          </Field>
          <Field label="Sueldo candidato (MXN)" htmlFor="sueldo_candidato">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
              <input
                id="sueldo_candidato"
                name="sueldo_candidato"
                type="number"
                min="0"
                step="0.01"
                value={form.sueldo_candidato}
                onChange={onChange}
                placeholder="12500"
                className={`${inputBase} pl-7`}
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* ============ SECCIÓN 3: INFORMACIÓN FINANCIERA (SOLO Super_Admin) ============ */}
      {puedeVerFinanzas ? (
        <Section
          n="03"
          titulo="Información financiera"
          desc="Visible y editable ÚNICAMENTE por el Super_Admin. Administradores de agencia y reclutadores freelance nunca verán estos valores."
          badge="SOLO SUPER ADMIN"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Tarifa Cobrada al Cliente (MXN)" htmlFor="cobro_cliente" hint="Monto facturado mensualmente al cliente por este puesto. No es visible para freelancers.">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                <input
                  id="cobro_cliente"
                  name="cobro_cliente"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cobro_cliente}
                  onChange={onChange}
                  placeholder="22000"
                  className={`${inputBase} pl-7`}
                />
              </div>
            </Field>
            <Field label="Comisión Reclutador (MXN)" htmlFor="comision_freelance" hint="Pago único al reclutador por cada candidato contratado. Es el margen del freelancer.">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                <input
                  id="comision_freelance"
                  name="comision_freelance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comision_freelance}
                  onChange={onChange}
                  placeholder="2500"
                  className={`${inputBase} pl-7`}
                />
              </div>
            </Field>
          </div>
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            🔒 Estos campos están protegidos por la política RLS <code>super_admin_full_access</code>
            y por condicionales en el frontend. Los freelancers que consulten la vacante verán la vista{' '}
            <code>vacantes_public_view</code>, que omite estas columnas. Ni siquiera el DOM
            los recibe.
          </div>
        </Section>
      ) : (
        <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50 p-5 text-sm text-rose-800 flex gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-ink-900">Información financiera restringida a Super_Admin</p>
            <p className="mt-1">
              Tu rol actual (<strong>{rolCreador}</strong>) no tiene permisos para ver ni editar
              <code className="mx-1">cobro_cliente</code>ni
              <code className="mx-1">comision_freelance</code>.
              Estos campos ni siquiera se renderizan en el DOM.
            </p>
          </div>
        </div>
      )}

      {/* ============ SECCIÓN 4: ASIGNACIÓN + DELICADA ============ */}
      <Section
        n={puedeVerFinanzas ? '04' : '03'}
        titulo="Asignación y configuración"
        desc="Define quién coordina la vacante y si requiere aprobación especial."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Coordinador asignado" htmlFor="asignado_a_coordinador_id">
            <select
              id="asignado_a_coordinador_id"
              name="asignado_a_coordinador_id"
              value={form.asignado_a_coordinador_id}
              onChange={onChange}
              className={inputBase}
            >
              <option value="">— Sin asignar —</option>
              {COORDINADORES_DEMO.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre_completo}</option>
              ))}
            </select>
          </Field>

          <Field label="Vacantes disponibles" htmlFor="vacantes_disponibles">
            <input
              id="vacantes_disponibles"
              name="vacantes_disponibles"
              type="number"
              min="1"
              value={form.vacantes_disponibles}
              onChange={onChange}
              className={inputBase}
            />
          </Field>
        </div>

        {/* TOGGLE DELICADA */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-100 text-rose-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <h4 className="text-sm font-bold text-ink-900">Vacante Delicada</h4>
                {esDelicada && (
                  <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    Activado
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Los candidatos evaluados de esta vacante <strong>no serán visibles al cliente</strong>
                hasta que un <strong>Coordinador</strong> los apruebe manualmente. Úsalo para roles con
                manejo de efectivo, información confidencial o reingresos sensibles.
              </p>
            </div>

            {/* Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={esDelicada}
              onClick={() => setEsDelicada((v) => !v)}
              className={[
                'relative inline-flex h-7 w-12 flex-none items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                esDelicada ? 'bg-rose-500' : 'bg-slate-300',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
                  esDelicada ? 'translate-x-6' : 'translate-x-1',
                ].join(' ')}
              />
            </button>
          </div>

          {esDelicada && (
            <div className="mt-4 rounded-md bg-white border border-rose-200 p-4 text-xs text-rose-800 space-y-2">
              <p>
                <strong>🔒 Flujo activado · Sin automatización:</strong>
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Los candidatos se registran con estatus <code className="bg-rose-100 px-1 rounded">Pendiente de Aprobación</code>.</li>
                <li>NO son visibles para el cliente hasta que el Coordinador los apruebe.</li>
                <li>La <strong>coordinación de entrevistas es 100% manual</strong> por el Administrador.</li>
                <li>Mostrarán el badge <span className="font-bold">🔒 Delicada</span> en todos los dashboards.</li>
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* ============ FOOTER CON BOTONES ============ */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center items-center rounded-md bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creando…' : 'Publicar vacante'}
          </button>
        </div>
      </div>

      {status.state === 'success' && (
        <div role="status" className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          {status.message} Redirigiendo al dashboard…
        </div>
      )}
      {status.state === 'error' && (
        <div role="alert" className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          {status.message}
        </div>
      )}
    </form>
  );
}

function Section({ n, titulo, desc, badge, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-ink-900 text-white text-sm font-bold">
            {n}
          </span>
          <div>
            <h3 className="text-lg font-bold text-ink-900">{titulo}</h3>
            {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
          </div>
        </div>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider ring-1 ring-amber-200">
            🔒 {badge}
          </span>
        )}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}