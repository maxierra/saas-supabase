'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PendingPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Pago en proceso
            </h2>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Tu pago está siendo procesado. Esto puede tomar unos minutos.
              </p>
              {paymentId && (
                <p className="text-sm text-gray-500 mt-1">
                  ID de pago: {paymentId}
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Una vez que el pago sea confirmado, tu suscripción se activará automáticamente.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Puedes verificar el estado de tu suscripción en cualquier momento desde el dashboard.
              </p>
            </div>
            
            <div className="mt-6">
              {user ? (
                <Link 
                  href={`/app/${user.id}/dashboard`}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir al Dashboard
                </Link>
              ) : (
                <div className="animate-pulse bg-blue-600 w-full py-2 px-4 rounded-md opacity-70">
                  Cargando...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
