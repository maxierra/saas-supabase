'use client';

import { useState } from 'react';

interface BasicPaymentButtonProps {
  plan: 'monthly' | 'annual';
  userEmail: string;
  subscriptionId?: string; // Opcional para compatibilidad con la página de suscripciones
  userId?: string; // ID del usuario para rastrear quién realizó el pago
}

export default function BasicPaymentButton({ plan, userEmail, subscriptionId, userId }: BasicPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentUrl(null);

    try {
      console.log('Iniciando proceso de pago básico para:', { plan, userEmail, subscriptionId, userId });
      
      // Determinar URL de API
      const apiUrl = window.location.origin;
      console.log('API URL:', apiUrl);
      
      // Solicitar preferencia de pago
      const response = await fetch(`${apiUrl}/api/mercadopago/create-preference-basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userEmail,
          subscriptionId,
          userId,
        }),
      });
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Error: La respuesta no es JSON (básico)', responseText);
        
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
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de preferencia de pago (básico):', data);
      
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
      console.error('Error en el proceso de pago (básico):', err);
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
      
      {paymentUrl && (
        <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          <p>Si la página de pago no se abrió automáticamente, <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">haz clic aquí</a>.</p>
        </div>
      )}
    </div>
  );
}
