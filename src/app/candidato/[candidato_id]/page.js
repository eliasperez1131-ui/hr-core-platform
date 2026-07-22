import { notFound } from 'next/navigation';
import CandidatoView   from '@/components/candidato/CandidatoView';
import {
  getDemoCandidato,
  getDemoResultado,
  getVacanteDemo,
} from '@/lib/candidato-data';

export const metadata = {
  title: 'Perfil del Candidato · HR CORE',
  description: 'Resultados psicométricos, CV y datos del candidato.',
  robots: { index: false, follow: false },
};

export default function CandidatoPage({ params, searchParams }) {
  const { candidato_id } = params;
  if (!candidato_id) notFound();

  // Modo lectura: ?share=1 o ?rol=Cliente_Invitado|cliente_invitado
  const rawRol = (searchParams && searchParams.rol) || '';
  const shareFlag = (searchParams && (searchParams.share === '1' || searchParams.share === 'true'));
  const rolLectura = ['Cliente_Invitado', 'cliente_invitado'].includes(rawRol) || shareFlag;
  const rol = rolLectura ? 'Cliente_Invitado' : rawRol || 'Reclutador_Freelance';

  // Cargar datos (en producción sería Supabase)
  const candidato = getDemoCandidato(candidato_id);
  const resultado = getDemoResultado(candidato_id);
  const vacante = getVacanteDemo(candidato_id);

  return (
    <CandidatoView
      candidato={candidato}
      vacante={vacante}
      resultado={resultado}
      rol={rol}
      readOnly={rolLectura}
    />
  );
}