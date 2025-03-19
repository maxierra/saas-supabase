'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  plan: 'monthly' | 'annual';
  subscriptionId: string;
  userEmail: string;
}

export default function PaymentButton({ plan, subscriptionId, userEmail }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar la URL base del navegador en lugar de depender de variables de entorno
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api`;
      
      console.log('Iniciando proceso de pago con:', {
        plan,
        subscriptionId,
        userEmail,
        apiUrl,
        baseUrl
      });
      
      // Solicitar preferencia de pago
      const response = await fetch(`${apiUrl}/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          subscriptionId,
          userEmail,
        }),
      });
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Error: La respuesta no es JSON', responseText);
        
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
      
      if (!response.ok) {
        console.error('Error en la respuesta:', data);
        throw new Error(data.error || 'Error al procesar el pago');
      }
      
      if (!data.init_point) {
        console.error('Error: No se recibió init_point en la respuesta', data);
        throw new Error('Error en la configuración del pago. Contacte al administrador.');
      }
      
      console.log('Preferencia de pago creada:', data);
      
      // Redirigir a la página de pago en una nueva pestaña
      window.open(data.init_point, '_blank');
      
    } catch (error: any) {
      console.error('Error en el proceso de pago:', error);
      setError(error.message || 'Error desconocido al procesar el pago');
      // Mostrar error en la UI
      alert(`Error de pago: ${error.message || 'Ocurrió un error al procesar el pago. Intente nuevamente más tarde.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        {loading ? (
          <>
            <span className="inline-block mr-2 animate-spin">⟳</span>
            Procesando...
          </>
        ) : (
          `Pagar suscripción ${plan === 'monthly' ? 'mensual' : 'anual'}`
        )}
      </button>
    </div>
  );
}
