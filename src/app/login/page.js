import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm  from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar sesión · HR CORE',
  description: 'Accede a tu plataforma de evaluaciones psicométricas y ATS.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Inicia sesión en tu cuenta"
      subtitle="Ingresa tus credenciales para acceder a tu panel."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="font-semibold text-brand-600 hover:text-brand-800">
            Crear cuenta gratis
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}