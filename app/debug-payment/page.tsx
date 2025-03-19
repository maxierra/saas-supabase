'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DebugPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [credentialsInfo, setCredentialsInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Obtener información del entorno
    fetchEnvironmentInfo();
    
    // Verificar credenciales
    checkCredentials();
  }, []);

  const fetchEnvironmentInfo = async () => {
    try {
      const response = await fetch('/api/debug/environment');
      const data = await response.json();
      setEnvInfo(data);
    } catch (err: any) {
      console.error('Error al obtener información del entorno:', err);
    }
  };
  
  const checkCredentials = async () => {
    try {
      const response = await fetch('/api/check-credentials');
      const data = await response.json();
      setCredentialsInfo(data);
    } catch (err: any) {
      console.error('Error al verificar credenciales:', err);
    }
  };

  const createTestPayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentInfo(null);

    try {
      // Crear una preferencia de pago de prueba
      const response = await fetch('/api/debug/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Pago de prueba para depuración',
          price: 100,
          email: 'test_user_debug@testuser.com'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error del servidor: ${response.status}`);
      }
      
      setPaymentInfo(data);
      
    } catch (err: any) {
      console.error('Error al crear pago de prueba:', err);
      setError(err.message || 'Ocurrió un error al crear el pago de prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Depuración de Pagos</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Información del Entorno</h2>
              
              {envInfo ? (
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-medium mb-2">Variables de Entorno</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(envInfo.env, null, 2)}
                  </pre>
                  
                  <h3 className="font-medium mt-4 mb-2">Información del Servidor</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(envInfo.server, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">Cargando información del entorno...</p>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Estado de Credenciales</h2>
              
              {credentialsInfo ? (
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-medium mb-2">Estado de Variables</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(credentialsInfo.environment, null, 2)}
                  </pre>
                  
                  <h3 className="font-medium mt-4 mb-2">Estado del Token</h3>
                  <div className={`p-3 rounded text-sm ${
                    credentialsInfo.token.status === 'Válido' 
                      ? 'bg-green-100 text-green-800' 
                      : credentialsInfo.token.status === 'Inválido'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <p><strong>Estado:</strong> {credentialsInfo.token.status}</p>
                    {credentialsInfo.token.error && (
                      <p><strong>Error:</strong> {credentialsInfo.token.error}</p>
                    )}
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-600">
                    Verificado el: {new Date(credentialsInfo.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Verificando credenciales...</p>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Crear Pago de Prueba</h2>
              
              <button
                onClick={createTestPayment}
                disabled={loading}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50"
              >
                {loading ? 'Creando pago...' : 'Crear Pago de Prueba'}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              
              {paymentInfo && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Respuesta del Servidor</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(paymentInfo, null, 2)}
                  </pre>
                  
                  {paymentInfo.init_point && (
                    <div className="mt-4">
                      <p className="mb-2">Puedes probar el pago usando este enlace:</p>
                      <a 
                        href={paymentInfo.init_point} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md"
                      >
                        Ir a la página de pago
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-800 mb-2">Pasos para depurar problemas de pago</h3>
              <ol className="list-decimal pl-5 text-sm text-yellow-700 space-y-2">
                <li>Verifica que todas las variables de entorno necesarias estén configuradas correctamente.</li>
                <li>Asegúrate de que estás usando las credenciales correctas (producción o prueba).</li>
                <li>Revisa los logs del servidor para ver si hay errores específicos.</li>
                <li>Prueba crear un pago y observa la respuesta del servidor.</li>
                <li>Si el pago se crea correctamente pero falla al procesarse, revisa los datos del comprador y la tarjeta.</li>
                <li>Verifica que la moneda y el país configurados sean correctos.</li>
                <li>Asegúrate de que el webhook esté correctamente configurado para recibir notificaciones.</li>
              </ol>
            </div>
            
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-medium text-red-800 mb-2">Error detectado: Token de acceso inválido</h3>
              <p className="text-sm text-red-700 mb-4">
                Se ha detectado que el token de acceso no es válido o ha expirado. Para solucionar este problema:
              </p>
              <ol className="list-decimal pl-5 text-sm text-red-700 space-y-2">
                <li><strong>Verifica tus credenciales:</strong> Accede a tu cuenta y asegúrate de tener las credenciales correctas.</li>
                <li><strong>Actualiza el archivo .env.local:</strong> Asegúrate de que las variables estén correctamente configuradas.</li>
                <li><strong>Reinicia el servidor:</strong> Después de actualizar las variables de entorno, reinicia el servidor para que los cambios surtan efecto.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
