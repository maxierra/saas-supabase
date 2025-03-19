'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BasicPaymentButton from '@/components/BasicPaymentButton';

export default function TestSimplePage() {
  const [userEmail, setUserEmail] = useState('test@example.com');
  const [userId, setUserId] = useState('test-user-' + Date.now());
  const [subscriptionId, setSubscriptionId] = useState('test-subscription-' + Date.now());
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Verificar si hay un status en la URL (redireccionado desde MercadoPago)
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setPaymentStatus(status);
      console.log('Estado de pago recibido:', status);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba Simple de Pago</h1>
          
          {paymentStatus && (
            <div className={`mb-6 p-4 border rounded ${
              paymentStatus === 'success' ? 'bg-green-50 border-green-200' : 
              paymentStatus === 'failure' ? 'bg-red-50 border-red-200' : 
              'bg-yellow-50 border-yellow-200'
            }`}>
              <h2 className="text-lg font-semibold mb-2">{
                paymentStatus === 'success' ? '¡Pago exitoso!' : 
                paymentStatus === 'failure' ? 'Pago fallido' : 
                'Pago pendiente'
              }</h2>
              <p>{
                paymentStatus === 'success' ? 'Tu pago ha sido procesado correctamente.' : 
                paymentStatus === 'failure' ? 'Hubo un problema al procesar tu pago.' : 
                'Tu pago está siendo procesado.'
              }</p>
            </div>
          )}
          
          <div className="mb-6 p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">Datos de Prueba</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Usuario
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Suscripción
              </label>
              <input
                type="text"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded">
              <h3 className="text-lg font-medium mb-4">Plan Mensual</h3>
              <p className="text-2xl font-bold mb-2">$20,000 <span className="text-sm font-normal text-gray-500">/ mes</span></p>
              <BasicPaymentButton 
                plan="monthly" 
                userEmail={userEmail} 
                userId={userId}
                subscriptionId={subscriptionId}
              />
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="text-lg font-medium mb-4">Plan Anual</h3>
              <p className="text-2xl font-bold mb-2">$200,000 <span className="text-sm font-normal text-gray-500">/ año</span></p>
              <BasicPaymentButton 
                plan="annual" 
                userEmail={userEmail} 
                userId={userId}
                subscriptionId={subscriptionId}
              />
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800 mb-2">Información para pruebas</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Para probar pagos, usa estas tarjetas de prueba:
            </p>
            <ul className="list-disc pl-5 text-sm text-yellow-700">
              <li><strong>Mastercard:</strong> 5031 7557 3453 0604 | CVV: 123 | Vencimiento: 11/25</li>
              <li><strong>Visa:</strong> 4509 9535 6623 3704 | CVV: 123 | Vencimiento: 11/25</li>
              <li><strong>American Express:</strong> 3711 803032 57522 | CVV: 1234 | Vencimiento: 11/25</li>
            </ul>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Para pagos aprobados:</strong> Usa cualquier número de documento<br/>
              <strong>Para pagos rechazados:</strong> Usa el documento 12345678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
