import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'HR CORE — Evaluaciones psicométricas + ATS para B2B',
  description:
    'Plataforma SaaS B2B con 7 pruebas psicométricas validadas y un ATS pipeline Kanban para agencias de reclutamiento y RR.HH.',
  keywords: ['psicométricos', 'ATS', 'reclutamiento', 'SaaS B2B', 'RRHH'],
  authors: [{ name: 'HR CORE' }],
  openGraph: {
    title: 'HR CORE — Contrata con ciencia, no con corazonadas',
    description:
      'Reduce rotación hasta un 38% con 7 pruebas validadas y un ATS diseñado para alto volumen.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}