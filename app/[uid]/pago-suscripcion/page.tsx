'use client';

import { useEffect, useState } from 'react';
import BasicPaymentButton from '@/components/BasicPaymentButton';
import { supabase } from '@/lib/supabase';

interface Pago {
  id: string;
  subscription_id: string;
  payment_id: string;
  status: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  external_reference: string;
  created_at: string;
}

export default function PagoSuscripcion({ params }: { params: { uid: string } }) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(false);

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear estado
  const formatStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'refunded':
        return 'Reembolsado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Función para formatear monto
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Obtener información del usuario
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Obtener información de la suscripción
          const { data: subscriptionData, error } = await supabase
            .from('suscripciones')
            .select('*')
            .eq('uid', user.id)
            .single();

          if (error) {
            console.error('Error al obtener suscripción:', error);
          } else {
            setSubscription(subscriptionData);

            console.log('Actualizando suscripción con ID:', subscriptionData.id);

            // Cargar historial de pagos si hay una suscripción
            if (subscriptionData && subscriptionData.id) {
              setLoadingPagos(true);
              const { data: pagosData, error: pagosError } = await supabase
                .from('pagos')
                .select('*')
                .eq('subscription_id', subscriptionData.id)
                .order('payment_date', { ascending: false });

              if (pagosError) {
                console.error('Error al obtener pagos:', pagosError);
              } else {
                setPagos(pagosData || []);
              }
              setLoadingPagos(false);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePayment = async () => {
    try {
      if (subscription.id !== '7fe25001-532c-4942-8e34-3e83ea97961c') {
        console.error('Desajuste de ID: el ID de suscripción no es el esperado.');
        alert('Error: el ID de suscripción no coincide.');
        return;
      }

      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlan === 'monthly' ? 100 : 1000, // $100 mensual o $1000 anual
          userEmail: user.email,
          subscriptionId: subscription.id,
          userId: params.uid,
          plan: selectedPlan,
          notification_url: 'https://1be6-2803-9800-902e-b7c1-3dcc-181c-5550-f8d.ngrok-free.app/api/mercadopago/webhook',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const data = await response.json();
      console.log('UID del usuario:', user.id);
      console.log('External ID generado:', data.external_reference);
      console.log('ID de Suscripción que se intenta guardar:', subscription.id);
      console.log('ID de Pago:', data.payment_id); 
      if (data.init_point) {
        // Abrir en nueva pestaña para mejor experiencia de usuario
        window.open(data.init_point, '_blank');
      } else {
        throw new Error('Error en la configuración del pago');
      }
    } catch (error) {
      console.error('Error en la llamada a la API:', error);
      alert(`Error: ${error.message || 'Ocurrió un error al procesar el pago'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso no autorizado</h1>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Pago de Suscripción</h1>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Estado de tu suscripción</h2>
            {subscription ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estado actual</p>
                    <p className="font-medium">
                      {subscription.estado === 'trial' && 'Período de prueba'}
                      {subscription.estado === 'active' && 'Activa'}
                      {subscription.estado === 'inactive' && 'Inactiva'}
                    </p>
                  </div>

                  {subscription.estado === 'trial' && subscription.trial_end_date && (
                    <div>
                      <p className="text-sm text-gray-500">Finaliza el período de prueba</p>
                      <p className="font-medium">
                        {formatDate(subscription.trial_end_date)}
                      </p>
                    </div>
                  )}

                  {subscription.next_payment_date && (
                    <div>
                      <p className="text-sm text-gray-500">Próximo pago</p>
                      <p className="font-medium">
                        {formatDate(subscription.next_payment_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No se encontró información de suscripción.</p>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecciona un plan</h2>
            <div className="border rounded-lg p-4 cursor-pointer border-blue-500 bg-blue-50">
              <h3 className="font-semibold text-gray-800">Plan Único</h3>
              <p className="text-sm text-gray-500">Facturación única de $100</p>
              <span className="text-2xl font-bold text-gray-800">$100</span>
              <button onClick={handlePayment} className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
                Pagar $100
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de pagos</h2>
            
            {loadingPagos ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pagos.length > 0 ? (
              <ul className="space-y-4">
                {pagos.map((pago) => (
                  <li key={pago.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Fecha de pago</p>
                        <p className="font-medium">{formatDate(pago.payment_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <p className="font-medium">{formatStatus(pago.status)}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-lg font-bold text-gray-800">{formatAmount(pago.amount)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Método de pago: {pago.payment_method}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-500">No hay pagos registrados para esta suscripción.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
