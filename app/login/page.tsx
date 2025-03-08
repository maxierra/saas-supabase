'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just registered
    const registered = searchParams.get('registered');
    if (registered) {
      setMessage('Registro exitoso. Por favor, inicia sesión.');
    }
  }, [searchParams]);

  return (
    <AuthLayout title="Bienvenido de nuevo">
      <LoginForm message={message} />
    </AuthLayout>
  );
}