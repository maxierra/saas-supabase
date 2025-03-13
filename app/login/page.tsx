'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

function LoginContent() {
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just registered
    const registered = searchParams.get('registered');
    if (registered) {
      setMessage('Registro exitoso. Por favor, inicia sesión.');
    }
  }, [searchParams]);

  return <LoginForm message={message} />;
}

export default function Login() {
  return (
    <AuthLayout title="Bienvenido de nuevo">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  );
}