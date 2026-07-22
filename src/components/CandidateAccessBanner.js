/**
 * CandidateAccessBanner — bloque para explicar al visitante el
 * flujo de acceso del candidato con teléfono + token seguro.
 */
export default function CandidateAccessBanner() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: copy */}
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                🔐 Acceso seguro de candidatos
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-900">
                Teléfono + Token único.<br />
                <span className="text-brand-600">Sin contraseñas, sin links públicos.</span>
              </h2>
              <p className="mt-4 text-slate-600">
                El candidato entra a su evaluación con dos datos que solo él conoce.
                El sistema genera un token de 7 caracteres con un <strong>alfabeto seguro</strong>
                (sin O, 0, I, L, 1) para evitar errores de captura al transcribir.
              </p>

              <div className="mt-6 space-y-3">
                <Step
                  n="01"
                  title="Reclutador registra al candidato"
                  desc="Alta manual o postulación. El backend genera automáticamente el token."
                />
                <Step
                  n="02"
                  title="Reclutador comparte teléfono + token"
                  desc="Por correo, WhatsApp o SMS. El candidato anota el código."
                />
                <Step
                  n="03"
                  title="Candidato entra a /acceso-evaluacion"
                  desc="Escribe su teléfono + token. El sistema valida y lo redirige al motor."
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/acceso-evaluacion"
                  className="inline-flex items-center rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-5 py-3 transition"
                >
                  Probar acceso de candidato →
                </a>
                <a
                  href="/registrar-candidato"
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold px-5 py-3 transition"
                >
                  Registrar candidato (demo)
                </a>
              </div>
            </div>

            {/* Right: visual del flujo */}
            <div className="relative bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white p-8 lg:p-12">
              <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-15" />
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />

              <div className="relative space-y-4">
                <p className="text-[10px] uppercase tracking-wider text-brand-300">
                  Ejemplo de token generado
                </p>

                <div className="rounded-2xl bg-white/10 backdrop-blur p-5 ring-1 ring-white/20">
                  <p className="text-[10px] uppercase tracking-wider text-brand-300">Candidato</p>
                  <p className="text-base font-bold mt-0.5">Roberto Quintero Saavedra</p>
                  <p className="text-xs text-slate-300 mt-0.5">+52 55 1234 5678</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 ring-1 ring-white/30 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/80">Token</p>
                  <p className="mt-1 font-mono text-3xl font-extrabold tracking-widest">
                    H7K2P5N
                  </p>
                  <p className="text-[10px] text-white/70 mt-1">
                    7 chars · sin O · sin 0 · sin I · sin L · sin 1
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur p-5 ring-1 ring-white/20">
                  <p className="text-[10px] uppercase tracking-wider text-brand-300">Acceso</p>
                  <p className="font-mono text-xs text-emerald-300 mt-1 break-all">
                    /acceso-evaluacion
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded bg-white/5 p-2 ring-1 ring-white/10">
                      <p className="text-slate-400">Teléfono</p>
                      <p className="font-mono">+52 55 1234 5678</p>
                    </div>
                    <div className="rounded bg-white/5 p-2 ring-1 ring-white/10">
                      <p className="text-slate-400">Token</p>
                      <p className="font-mono">H7K2P5N</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-ink-900 text-white text-xs font-bold">
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-slate-600">{desc}</p>
      </div>
    </div>
  );
}