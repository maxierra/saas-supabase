'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function TestCheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    // Obtener la clave pública de MercadoPago desde las variables de entorno
    const mpPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    setPublicKey(mpPublicKey || 'TEST-8d3dc787-99b3-4a7a-8dcc-25a5a98b0e50');
  }, []);

  // Inicializar el botón de pago cuando el SDK esté listo y tengamos un ID de preferencia
  useEffect(() => {
    if (sdkReady && preferenceId && publicKey) {
      try {
        console.log('Inicializando botón de pago con:', { preferenceId, publicKey });
        
        // Usar la variable global MercadoPago
        const mp = new (window as any).MercadoPago(publicKey, {
          locale: 'es-AR'
        });

        // Eliminar botón anterior si existe
        const oldButton = document.getElementById('checkout-btn');
        if (oldButton) {
          oldButton.innerHTML = '';
        }

        // Crear botón de pago
        mp.checkout({
          preference: {
            id: preferenceId
          },
          render: {
            container: '#checkout-btn',
            label: 'Pagar ahora',
          }
        });
      } catch (err: any) {
        console.error('Error al inicializar botón de pago:', err);
        setError(`Error al inicializar botón de pago: ${err.message}`);
      }
    }
  }, [sdkReady, preferenceId, publicKey]);

  const createPreference = async () => {
    setLoading(true);
    setError(null);
    setPreferenceId(null);

    try {
      // Determinar URL de API
      const apiUrl = window.location.origin;
      console.log('API URL:', apiUrl);
      
      // Solicitar preferencia de pago
      const response = await fetch(`${apiUrl}/api/test/direct-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Prueba de checkout integrado',
          price: 1000,
          email: 'test_user_123456@testuser.com'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de preferencia de pago:', data);
      
      if (data.error) {
        console.error('Error en los datos de respuesta:', data.error);
        throw new Error(data.error);
      }
      
      if (!data.id) {
        console.error('No se recibió el ID de preferencia:', data);
        throw new Error('No se recibió el ID de preferencia');
      }
      
      // Guardar el ID de preferencia
      setPreferenceId(data.id);
      
    } catch (err: any) {
      console.error('Error al crear preferencia de pago:', err);
      setError(err.message || 'Ocurrió un error al crear la preferencia de pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          console.log('SDK de MercadoPago cargado');
          setSdkReady(true);
        }}
        onError={(e) => {
          console.error('Error al cargar SDK de MercadoPago:', e);
          setError('Error al cargar SDK de MercadoPago');
        }}
      />
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba de Checkout Integrado</h1>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Esta página utiliza el SDK de MercadoPago para crear un botón de pago integrado.
              Primero crea una preferencia de pago y luego muestra el botón de pago.
            </p>
            
            <button
              onClick={createPreference}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50 mb-4"
            >
              {loading ? 'Creando preferencia...' : 'Crear Preferencia de Pago'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {preferenceId && (
              <div className="mt-4">
                <p className="text-green-700 font-bold mb-2">Preferencia creada con ID: {preferenceId}</p>
                <div id="checkout-btn" className="mt-4"></div>
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
