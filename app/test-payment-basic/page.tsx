'use client';

import { useState } from 'react';
import BasicPaymentButton from '@/components/BasicPaymentButton';

export default function TestBasicPaymentPage() {
  const [userEmail, setUserEmail] = useState('test@example.com');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Prueba Básica de Pago con MercadoPago</h1>
          
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
              <h3 className="text-lg font-medium mb-4">Plan Mensual (Básico)</h3>
              <p className="text-2xl font-bold mb-2">$20,000 <span className="text-sm font-normal text-gray-500">/ mes</span></p>
              <BasicPaymentButton 
                plan="monthly" 
                userEmail={userEmail} 
              />
            </div>
            
            <div className="p-4 border rounded border-blue-200 bg-blue-50">
              <h3 className="text-lg font-medium mb-4">Plan Anual (Básico)</h3>
              <p className="text-2xl font-bold mb-2">$200,000 <span className="text-sm font-normal text-gray-500">/ año</span></p>
              <p className="text-sm text-green-600 mb-2">¡2 meses gratis!</p>
              <BasicPaymentButton 
                plan="annual" 
                userEmail={userEmail} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
