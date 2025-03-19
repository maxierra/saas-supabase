'use client';

import { useState } from 'react';

interface SimplePaymentButtonProps {
  plan: 'monthly' | 'annual';
  userEmail: string;
}

export default function SimplePaymentButton({ plan, userEmail }: SimplePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando proceso de pago simple para:', { plan, userEmail });
      
      // Determinar URL de API
      const apiUrl = window.location.origin;
      console.log('API URL:', apiUrl);
      
      // Solicitar preferencia de pago
      const response = await fetch(`${apiUrl}/api/mercadopago/create-preference/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userEmail,
        }),
      });
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Error: La respuesta no es JSON (simple)', responseText);
        
        // Intentar extraer información útil del HTML
        let errorMessage = 'Respuesta del servidor inválida. Intente nuevamente más tarde.';
        if (responseText.includes('<title>')) {
          const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            errorMessage += ` (${titleMatch[1]})`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Respuesta de preferencia de pago (simple):', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.init_point) {
        throw new Error('No se recibió el punto de inicio de pago');
      }
      
      // Redirigir al usuario a la página de pago en una nueva pestaña
      window.open(data.init_point, '_blank');
      
    } catch (err: any) {
      console.error('Error en el proceso de pago (simple):', err);
      setError(err.message || 'Ocurrió un error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50"
      >
        {loading ? 'Procesando...' : `Pagar ${plan === 'monthly' ? 'Mensual' : 'Anual'}`}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
