'use client';

import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir si no se está en el cliente
    if (typeof window === 'undefined') {
      router.push('/'); // Redirigir a la página de inicio o a otra página adecuada
    }
  }, [router]);

  return (
    <AuthLayout title="Recupera tu contraseña">
      <ResetPasswordForm />
    </AuthLayout>
  );
}