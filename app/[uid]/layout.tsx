'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/dashboard/Sidebar';
import { supabase } from '../../lib/supabase';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No está autenticado, redirigir a login
        router.push('/login');
        return;
      }

      // Verificar si el UID en la URL coincide con el UID del usuario autenticado
      if (session.user.id !== uid) {
        // No está autorizado para acceder a este tenant
        router.push(`/${session.user.id}/dashboard`);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, uid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // No renderizar nada mientras se redirige
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar userUid={uid} />
      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
