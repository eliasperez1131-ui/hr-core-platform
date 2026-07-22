import Link from 'next/link';
import AuthLayout   from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear cuenta · HR CORE',
  description: 'Regístrate y comienza a evaluar talento con 7 pruebas psicométricas validadas.',
};

export default function RegistroPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta de Cliente SaaS"
      subtitle="14 días de prueba con acceso completo al catálogo. Sin tarjeta de crédito."
      footer={
        <>
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-800">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <RegisterForm />

      <div className="mt-6 rounded-md bg-brand-50 border border-brand-100 p-4 text-xs text-brand-900">
        <p className="font-semibold mb-1">¿Qué obtienes al registrarte?</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Workspace dedicado para tu empresa</li>
          <li>Acceso a las 7 pruebas psicométricas</li>
          <li>Pipeline Kanban para gestionar candidatos</li>
          <li>Soporte por correo en español</li>
        </ul>
      </div>
    </AuthLayout>
  );
}