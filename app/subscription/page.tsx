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

  const handlePayment = async () => {
    try {
        const response = await fetch('/api/mercadopago/create-preference-basic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 100, // Monto fijo de $100
                userEmail: user?.email,
                subscriptionId: subscriptionInfo?.id,
                userId: user?.id,
            }),
        });

        const data = await response.json();
        if (data.init_point) {
            window.location.href = data.init_point; // Redirigir al usuario a la página de pago
        } else {
            console.error('Error al crear preferencia de pago:', data);
        }
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Suscripción Tienda360
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
              <div style={{ backgroundColor: '#add8e6', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>Suscripción Tienda360</h2>
                <p style={{ color: '#555', fontSize: '18px' }}>Facturación mensual de <strong style={{ color: '#e74c3c' }}>$20,000</strong>.</p>
                <h3 style={{ color: '#333', fontSize: '20px', marginTop: '20px' }}>Datos para la Transferencia:</h3>
                <p>Nombre: <strong>Maximiliano Erramouspe</strong></p>
                <p>CVU: <strong>0000003100115778926833</strong></p>
                <p>Alias: <strong>tienda360.mp</strong></p>
                <p>CUIT/CUIL: <strong>20255933923</strong></p>
                <p style={{ marginTop: '20px' }}>Cuando realices el pago, debes informarlo al <strong>1123145742</strong> y proporcionar tu correo electrónico de registro para identificar el pago.</p>
                <p>Mercado Pago: <a href="https://mpago.la/2549ciY" target="_blank" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', borderRadius: '5px', textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>Pagar aquí</a></p>
              </div>

              <div style={{ backgroundColor: '#f9c74f', padding: '15px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
                <h3 style={{ color: '#333', fontSize: '20px', fontWeight: 'bold' }}>¡Importante!</h3>
                <p style={{ color: '#333', fontSize: '16px' }}>Al realizar el pago e informarnos, su servicio se reestablecerá inmediatamente.</p>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecciona un plan</h2>
                  <div className="border rounded-lg p-4 cursor-pointer border-blue-500 bg-blue-50">
                    <h3 className="font-semibold text-gray-800">Plan Único</h3>
                    <p className="text-sm text-gray-500">Facturación mensual de $20,000</p>
                    <span className="text-2xl font-bold text-gray-800">$20,000</span>
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
