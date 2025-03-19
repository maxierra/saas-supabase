'use client';

import { useEffect, useState } from 'react';
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

export default function HistorialPagos({ params }: { params: { uid: string } }) {
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Obtener información del usuario
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Obtener suscripciones del usuario
          const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('suscripciones')
            .select('id')
            .eq('uid', user.id);
            
          if (subscriptionsError) {
            console.error('Error al obtener suscripciones:', subscriptionsError);
            setError('No se pudieron cargar las suscripciones');
            return;
          }
          
          if (!subscriptions || subscriptions.length === 0) {
            setLoading(false);
            return; // No hay suscripciones, no hay pagos
          }
          
          // Obtener IDs de suscripciones
          const subscriptionIds = subscriptions.map(sub => sub.id);
          
          // Obtener pagos de todas las suscripciones del usuario
          const { data: pagosData, error: pagosError } = await supabase
            .from('pagos')
            .select('*')
            .in('subscription_id', subscriptionIds)
            .order('payment_date', { ascending: false });
            
          if (pagosError) {
            console.error('Error al obtener pagos:', pagosError);
            setError('No se pudieron cargar los pagos');
            return;
          }
          
          setPagos(pagosData || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Ocurrió un error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [params.uid]);
  
  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Historial de Pagos</h1>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {pagos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay pagos registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID de Pago
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método de Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.payment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pago.status === 'approved' ? 'bg-green-100 text-green-800' :
                          pago.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatStatus(pago.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAmount(pago.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.payment_method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
