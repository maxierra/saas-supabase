'use client';

import { useState } from 'react';

export default function TestWebhook() {
  const [paymentId, setPaymentId] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [status, setStatus] = useState('approved');
  const [amount, setAmount] = useState('20000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Simular una notificación de pago de MercadoPago
      const response = await fetch('/api/mercadopago/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `type=payment&id=${paymentId}`,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error al enviar webhook:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para simular el objeto de pago que devolvería MercadoPago
  const simulatePaymentObject = () => {
    return {
      id: paymentId,
      status: status,
      transaction_amount: parseFloat(amount),
      external_reference: externalReference,
      payment_method_id: 'visa',
      date_created: new Date().toISOString(),
    };
  };

  // Función para simular la respuesta de MercadoPago al webhook
  const simulatePaymentResponse = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Crear un mock del objeto Payment que devolvería MercadoPago
      const mockPayment = simulatePaymentObject();
      
      // Enviar una solicitud al endpoint del webhook con los datos simulados
      const response = await fetch('/api/test/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment: mockPayment,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error al simular pago:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba de Webhook de MercadoPago</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Simular notificación de pago</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Pago
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia Externa
                </label>
                <input
                  type="text"
                  value={externalReference}
                  onChange={(e) => setExternalReference(e.target.value)}
                  placeholder="Ej: user_123_subscription_456_1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Formato: user_[userId]_subscription_[subscriptionId]_[timestamp]
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Pago
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="approved">Aprobado</option>
                  <option value="pending">Pendiente</option>
                  <option value="rejected">Rechazado</option>
                  <option value="refunded">Reembolsado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Notificación'}
                </button>
                
                <button
                  type="button"
                  onClick={simulatePaymentResponse}
                  disabled={loading}
                  className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:opacity-50"
                >
                  Simular Respuesta Completa
                </button>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Resultado</h2>
              <div className="p-4 bg-gray-50 rounded overflow-auto max-h-60">
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800 mb-2">Información</h3>
            <p className="text-sm text-yellow-700">
              Esta página es solo para pruebas. En un entorno de producción, MercadoPago enviará notificaciones 
              automáticamente a la URL configurada en tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
