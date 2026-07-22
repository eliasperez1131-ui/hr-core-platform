export default function HowItWorks() {
  const pasos = [
    {
      n: '01',
      titulo: 'Captura del candidato',
      descripcion:
        'Registro por correo o teléfono con validación cruzada (UNIQUE KEY) para evitar duplicados en tu CRM de talento.',
    },
    {
      n: '02',
      titulo: 'Aplica las 7 pruebas',
      descripcion:
        'El coordinador dispara las pruebas psicométricas desde la vacante. Resultados automáticos en menos de 30 min.',
    },
    {
      n: '03',
      titulo: 'Scoring y ranking',
      descripcion:
        'Algoritmo de matching por puesto: top-match, apto, revisar. Compatible con roles delicados (es_delicada = true).',
    },
    {
      n: '04',
      titulo: 'Pipeline Kanban',
      descripcion:
        'Reclutadores freelance y coordinadores mueven al candidato por estados. Privacidad financiera garantizada por RLS.',
    },
  ];

  return (
    <section id="como-funciona" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-brand-600 uppercase tracking-wider">
            Cómo funciona
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            De la postulación al contrato en 4 pasos
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pasos.map((p) => (
            <div
              key={p.n}
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <span className="absolute -top-4 left-6 inline-flex h-8 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-bold text-white">
                {p.n}
              </span>
              <h3 className="mt-2 text-lg font-bold text-ink-900">{p.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}