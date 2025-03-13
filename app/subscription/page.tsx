'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired');

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
          setSubscriptionInfo(subscriptionData);
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {expired ? 'Tu suscripción está inactiva' : 'Actualiza tu suscripción'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lo sentimos, debes abonar tu suscripción para seguir usando el software
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  $29 <span className="ml-1 text-2xl font-medium">/mes</span>
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

            {showPaymentInfo && (
              <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700 font-medium">Realiza tu pago mediante transferencia bancaria:</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <p><span className="font-semibold">Alias:</span> TU.ALIAS.AQUI</p>
                      <p><span className="font-semibold">CBU:</span> XXXX XXXX XXXX XXXX XXXX</p>
                      <p><span className="font-semibold">Titular:</span> Tu Nombre</p>
                      <p><span className="font-semibold">Banco:</span> Nombre del Banco</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">Una vez realizado el pago, envíanos el comprobante a:</p>
                    <p className="font-medium mt-1">tu@email.com</p>
                    <p className="text-sm mt-2 text-yellow-700">Activaremos tu cuenta en menos de 24 horas hábiles.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link href={user ? `/${user.id}/dashboard` : '/login'} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Volver al dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
