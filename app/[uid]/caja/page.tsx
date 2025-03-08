'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
// Usar solo los iconos que realmente utilizamos
import { BanknotesIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';

export default function CajaPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Usar useState sin el setter ya que no lo utilizamos en este ejemplo
  const [transacciones] = useState([
    { id: 1, fecha: '2025-03-08 14:25', tipo: 'Ingreso', metodo: 'Efectivo', monto: 1250.50, concepto: 'Venta #1045' },
    { id: 2, fecha: '2025-03-08 12:10', tipo: 'Ingreso', metodo: 'Tarjeta', monto: 850.75, concepto: 'Venta #1044' },
    { id: 3, fecha: '2025-03-08 11:30', tipo: 'Egreso', metodo: 'Efectivo', monto: 300.00, concepto: 'Pago proveedor' },
    { id: 4, fecha: '2025-03-08 10:15', tipo: 'Ingreso', metodo: 'MercadoPago', monto: 1500.25, concepto: 'Venta #1043' },
    { id: 5, fecha: '2025-03-08 09:00', tipo: 'Egreso', metodo: 'Transferencia', monto: 450.00, concepto: 'Servicios' },
  ]);

  // Calcular saldos
  const ingresos = transacciones
    .filter(t => t.tipo === 'Ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const egresos = transacciones
    .filter(t => t.tipo === 'Egreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const saldoActual = ingresos - egresos;

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Caja</h1>
        <p className="text-sm text-gray-600 mt-1 sm:mt-0">
          ID de usuario: {uid.substring(0, 8)}...
        </p>
      </div>
      
      {/* Resumen de Caja */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos del día</p>
              <p className="text-xl font-semibold text-gray-900">${ingresos.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Egresos del día</p>
              <p className="text-xl font-semibold text-gray-900">${egresos.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <BanknotesIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saldo actual</p>
              <p className="text-xl font-semibold text-gray-900">${saldoActual.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de Caja */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Ingreso
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Registrar Egreso
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center">
          <ReceiptPercentIcon className="h-5 w-5 mr-2" />
          Imprimir Reporte
        </button>
      </div>
      
      {/* Tabla de Transacciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Movimientos del Día</h2>
            <div className="flex items-center">
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 mr-2"
                defaultValue="2025-03-08"
              />
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                Filtrar
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacciones.map((transaccion) => (
                <tr key={transaccion.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaccion.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaccion.fecha}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaccion.tipo === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaccion.tipo}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaccion.metodo}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaccion.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}>
                      ${transaccion.monto.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaccion.concepto}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Ver</button>
                    <button className="text-gray-600 hover:text-gray-900">Anular</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
