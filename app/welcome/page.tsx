'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
// Removed unused Session import

interface User {
  id: string;
  email?: string;
}

export default function Welcome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ¡Bienvenido!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Has iniciado sesión correctamente con el correo: {user?.email}
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}