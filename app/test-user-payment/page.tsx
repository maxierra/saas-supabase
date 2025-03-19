'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TestUserPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
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

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentUrl(null);

    try {
      // Determinar URL de API
      const apiUrl = window.location.origin;
      console.log('API URL:', apiUrl);
      
      // Solicitar preferencia de pago directamente
      const response = await fetch(`${apiUrl}/api/test/direct-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Prueba de pago directo',
          price: 1000,
          email: 'test_user_123456@testuser.com' // Email del usuario de prueba
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de preferencia de pago (directo):', data);
      
      if (data.error) {
        console.error('Error en los datos de respuesta:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.init_point) {
        console.error('No se recibió el punto de inicio de pago:', data);
        throw new Error('No se recibió el punto de inicio de pago');
      }
      
      // Guardar la URL de pago
      setPaymentUrl(data.init_point);
      
      // Redirigir al usuario a la página de pago en una nueva pestaña
      console.log('Redirigiendo a:', data.init_point);
      window.open(data.init_point, '_blank');
      
    } catch (err: any) {
      console.error('Error en el proceso de pago (directo):', err);
      setError(err.message || 'Ocurrió un error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba de Pago con Usuario de Prueba</h1>
          
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
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Esta página realiza un pago directo con un usuario de prueba de MercadoPago.
              Usa un monto pequeño (1000 ARS) para facilitar las pruebas.
            </p>
            
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Realizar Pago de Prueba (1000 ARS)'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {paymentUrl && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <p>Si la página de pago no se abrió automáticamente, <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">haz clic aquí</a>.</p>
              </div>
            )}
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
