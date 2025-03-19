'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import VideoModal from '../../components/auth/VideoModal';

function LoginContent() {
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just registered
    const registered = searchParams.get('registered');
    if (registered) {
      setMessage('Registro exitoso. Por favor, inicia sesión.');
    }
  }, [searchParams]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={openModal} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#ffcc00', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', animation: 'pulse 1s infinite' }}>Aprendiendo a usar el sistema</button>
      </div>
      <LoginForm message={message} />
      <VideoModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
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