'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import PaymentInfoModal from './PaymentInfoModal';

// Definir interfaces para los tipos
interface SubscriptionInfo {
  id: string;
  uid: string;
  estado: string;
  trial_end_date: string;
  [key: string]: any; // Para otras propiedades que pueda tener
}

// Componente cliente que usa useSearchParams
function SubscriptionContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const router = useRouter();
  
  // Movemos useSearchParams a un componente cliente separado
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const expired = searchParams?.get('expired');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.push('/login');
        return;
      }
      
      setUser(data.session.user);
      
      // Obtener información de la suscripción
      try {
        const { data: subscriptionData, error } = await supabase
          .from('suscripciones')
          .select('*')
          .eq('uid', data.session.user.id)
          .single();
          
        if (error) {
          console.error('Error al obtener la suscripción:', error);
        } else {
          setSubscriptionInfo(subscriptionData as SubscriptionInfo);
        }
      } catch (error) {
        console.error('Error inesperado:', error);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);

  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const handleShowPaymentInfo = () => {
    setShowPaymentInfo(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Suscripción
        </h2>
        {expired && (
          <div className="mt-2 text-center text-red-600">
            Tu suscripción ha expirado o no está activa.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="text-center">Cargando información de suscripción...</div>
          ) : (
            <div>
              {subscriptionInfo && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900">Estado de tu suscripción</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Estado:</span>{' '}
                      <span className={`${
                        subscriptionInfo.estado === 'active' ? 'text-green-600' : 
                        subscriptionInfo.estado === 'trial' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {subscriptionInfo.estado === 'active' ? 'Activa' : 
                         subscriptionInfo.estado === 'trial' ? 'Período de prueba' : 'Inactiva'}
                      </span>
                    </p>
                    {subscriptionInfo.estado === 'trial' && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Fecha de finalización:</span>{' '}
                        {new Date(subscriptionInfo.trial_end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden shadow-xl rounded-2xl text-white">
                  <div className="px-6 py-8 sm:p-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-extrabold">Plan Premium</h3>
                      <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                        Más Popular
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                      <span className="text-5xl font-extrabold">$20.000</span> <span className="ml-1 text-2xl font-medium">/mes</span>
                    </div>
                    <p className="mt-5 text-lg">Todo lo que necesitas para gestionar tu negocio de manera eficiente</p>
                  </div>
                  <div className="bg-white/10 px-6 py-8">
                    <ul className="space-y-4">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3">Gestión completa de inventario</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3">Reportes avanzados y estadísticas</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3">Control de ventas y facturación</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3">Soporte técnico prioritario</span>
                      </li>
                    </ul>
                  </div>
                  <div className="px-6 py-8">
                    <button
                      onClick={handleShowPaymentInfo}
                      className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl font-bold text-lg transition-colors duration-200 transform hover:scale-105"
                    >
                      Comenzar Ahora
                    </button>
                  </div>
                </div>

                <Suspense fallback={<div>Cargando...</div>}>
                  <PaymentInfoModal isOpen={showPaymentInfo} onClose={() => setShowPaymentInfo(false)} />
                </Suspense>

                <div className="text-center">
                  <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">Volver a la página principal</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
