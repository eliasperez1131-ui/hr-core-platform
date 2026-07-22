import Navbar               from '@/components/Navbar';
import Hero                 from '@/components/Hero';
import HowItWorks           from '@/components/HowItWorks';
import TestCatalog          from '@/components/TestCatalog';
import Plans                from '@/components/Plans';
import CandidateAccessBanner from '@/components/CandidateAccessBanner';
import Footer               from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <TestCatalog />
        <Plans />
        <CandidateAccessBanner />

        <section className="bg-ink-900 py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ¿Listo para profesionalizar tu reclutamiento?
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Solicita una demo gratuita de 30 minutos con uno de nuestros consultores.
            </p>
            <a
              href="/contacto"
              className="mt-8 inline-flex items-center rounded-md bg-brand-500 hover:bg-brand-600 px-8 py-4 text-white font-semibold transition shadow-glow"
            >
              Solicitar demo gratuita →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}