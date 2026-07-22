import Navbar      from '@/components/Navbar';
import Footer      from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contacto · HR CORE',
  description:
    'Solicita una demo o una cotización. Te contactamos en menos de 24 horas hábiles.',
};

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50">
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-900">
                Hablemos de tu proceso de selección
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Cuéntanos tu reto. Un ejecutivo comercial revisará tu caso y te contactará
                con una propuesta personalizada.
              </p>

              <div className="mt-10 space-y-6">
                <Item title="Para Empresas / Agencias">
                  Ideal si manejas +20 vacantes/mes y necesitas reducir rotación.
                </Item>
                <Item title="Para Reclutadores Freelance">
                  Únete como partner, accede al catálogo y cobra comisiones por cierres.
                </Item>
                <Item title="Tiempo de respuesta">
                  Menos de 24 hrs hábiles. Demos agendadas en Google Meet / Zoom.
                </Item>
              </div>

              <div className="mt-10 rounded-lg border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
                <strong>Privacidad:</strong> Tu solicitud entra a una fila de revisión del
                Super_Admin. No compartimos datos con terceros.
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 sm:p-10">
                <h2 className="text-xl font-bold text-ink-900">
                  Formulario de contacto
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Los campos marcados con * son obligatorios.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Item({ title, children }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-brand-500" />
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="text-sm text-slate-600">{children}</p>
      </div>
    </div>
  );
}