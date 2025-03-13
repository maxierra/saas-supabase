'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Subscription {
  id: string;
  uid: string;
  estado: 'trial' | 'active' | 'inactive';
  trial_start_date: string;
  trial_end_date: string;
  created_at: string;
  updated_at: string;
  payment_id?: string;
  user_email: string;
}

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Cargar suscripciones
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Obtener suscripciones desde la vista
      const { data, error } = await supabase
        .from('subscription_details')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Asignar los datos directamente ya que la vista incluye toda la información
      setSubscriptions(data || []);
    } catch (err) {
      setError('Error al cargar suscripciones: ' + (err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subId: string, newStatus: 'trial' | 'active' | 'inactive') => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar en la tabla original suscripciones
      const { error: updateError } = await supabase
        .from('suscripciones')
        .update({ 
          estado: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', subId);

      if (updateError) throw updateError;
      
      // Recargar suscripciones inmediatamente
      await loadSubscriptions();

      // Mostrar mensaje de éxito
      setError(`Estado actualizado a: ${newStatus}`);
    } catch (err: any) {
      setError(`Error al actualizar estado: ${err.message}`);
      console.error('Error actualizando suscripción:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerPayment = async (subId: string, amount: number) => {
    try {
      // Registrar pago
      const { error: paymentError } = await supabase
        .from('pagos')
        .insert({
          subscription_id: subId,
          amount,
          payment_date: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Actualizar estado a activo
      await updateSubscriptionStatus(subId, 'active');
      setShowPaymentModal(false);
    } catch (err) {
      setError('Error al registrar pago');
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Cargando suscripciones...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Suscripciones</h1>
      
      <div className="grid gap-6">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  Email del Usuario:
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                  {sub.user_email}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {sub.uid}
                </p>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-400">
                    Inicio Trial: {new Date(sub.trial_start_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Fin Trial: {new Date(sub.trial_end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${sub.estado === 'active' ? 'bg-green-100 text-green-800' : 
                    sub.estado === 'trial' ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {sub.estado === 'active' ? 'Activo' : 
                   sub.estado === 'trial' ? 'Prueba' : 'Inactivo'}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  Última actualización: {new Date(sub.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
              <button
                onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={sub.estado === 'active'}
              >
                Activar
              </button>
              <button
                onClick={() => updateSubscriptionStatus(sub.id, 'inactive')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={sub.estado === 'inactive'}
              >
                Desactivar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Registro de Pago */}
      {showPaymentModal && selectedSub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>
            <p className="mb-4">ID Usuario: {selectedSub.uid}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Estado Actual</label>
              <p className="text-sm text-gray-600">{selectedSub.estado}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Monto</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => registerPayment(selectedSub.id, 100)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
