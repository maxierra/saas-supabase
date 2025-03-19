'use client';

import { useState, useEffect } from 'react';
import SimplePaymentButton from '@/components/SimplePaymentButton';

export default function TestSimplePaymentPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('test@example.com');

  // Verificar estado de las variables de entorno
  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch('/api/debug/env');
        const data = await response.json();
        setEnvStatus(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error al verificar variables de entorno');
        setLoading(false);
      }
    }
    
    checkEnv();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba Simple de Pago con MercadoPago</h1>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Verificando configuración...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h2 className="text-lg font-semibold mb-2">Estado de Variables de Entorno</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">MercadoPago</h3>
                    <ul className="list-disc pl-5 text-sm">
                      <li className={envStatus?.envInfo?.mercadopago?.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY === 'Definido' ? 'text-green-600' : 'text-red-600'}>
                        NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: {envStatus?.envInfo?.mercadopago?.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY}
                      </li>
                      <li className={envStatus?.envInfo?.mercadopago?.MERCADOPAGO_ACCESS_TOKEN === 'Definido' ? 'text-green-600' : 'text-red-600'}>
                        MERCADOPAGO_ACCESS_TOKEN: {envStatus?.envInfo?.mercadopago?.MERCADOPAGO_ACCESS_TOKEN}
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">URLs</h3>
                    <ul className="list-disc pl-5 text-sm">
                      <li className={envStatus?.envInfo?.app?.NEXT_PUBLIC_BASE_URL === 'Definido' ? 'text-green-600' : 'text-red-600'}>
                        NEXT_PUBLIC_BASE_URL: {envStatus?.envInfo?.app?.NEXT_PUBLIC_BASE_URL}
                      </li>
                      <li className={envStatus?.envInfo?.app?.NEXT_PUBLIC_API_URL === 'Definido' ? 'text-green-600' : 'text-red-600'}>
                        NEXT_PUBLIC_API_URL: {envStatus?.envInfo?.app?.NEXT_PUBLIC_API_URL}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Entorno: {envStatus?.envInfo?.app?.NODE_ENV}</p>
                  <p>Timestamp: {envStatus?.serverInfo?.timestamp}</p>
                </div>
              </div>
              
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded">
                  <h3 className="text-lg font-medium mb-4">Plan Mensual (Simple)</h3>
                  <p className="text-2xl font-bold mb-2">$20,000 <span className="text-sm font-normal text-gray-500">/ mes</span></p>
                  <SimplePaymentButton 
                    plan="monthly" 
                    userEmail={userEmail} 
                  />
                </div>
                
                <div className="p-4 border rounded border-blue-200 bg-blue-50">
                  <h3 className="text-lg font-medium mb-4">Plan Anual (Simple)</h3>
                  <p className="text-2xl font-bold mb-2">$200,000 <span className="text-sm font-normal text-gray-500">/ año</span></p>
                  <p className="text-sm text-green-600 mb-2">¡2 meses gratis!</p>
                  <SimplePaymentButton 
                    plan="annual" 
                    userEmail={userEmail} 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
