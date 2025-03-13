'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface ReporteMovimiento {
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  motivo: string;
  monto: number;
  saldo_actual: number;
}

interface ResumenPeriodo {
  totalIngresos: number;
  totalEgresos: number;
  saldoFinal: number;
  movimientos: ReporteMovimiento[];
}

export default function ReportesCaja({ uid }: { uid: string }) {
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generarReporte = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Crear fechas en UTC para la consulta
      const startDate = new Date(fechaInicio);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(fechaFin);
      endDate.setUTCHours(23, 59, 59, 999);

      const { data: movimientos, error: movimientosError } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('uid', uid)
        .gte('fecha', startDate.toISOString())
        .lte('fecha', endDate.toISOString())
        .order('fecha', { ascending: true });

      if (movimientosError) {
        throw movimientosError;
      }

      const resumenPeriodo: ResumenPeriodo = {
        totalIngresos: 0,
        totalEgresos: 0,
        saldoFinal: 0,
        movimientos: movimientos || []
      };

      movimientos?.forEach(mov => {
        if (mov.tipo === 'ingreso') {
          resumenPeriodo.totalIngresos += mov.monto;
        } else {
          resumenPeriodo.totalEgresos += mov.monto;
        }
      });

      resumenPeriodo.saldoFinal = 
        resumenPeriodo.totalIngresos - resumenPeriodo.totalEgresos;

      setResumen(resumenPeriodo);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarExcel = () => {
    if (!resumen) return;

    const rows = [
      ['Fecha', 'Tipo', 'Motivo', 'Monto', 'Saldo'],
      ...resumen.movimientos.map(mov => [
        new Date(mov.fecha).toLocaleString(),
        mov.tipo,
        mov.motivo,
        mov.monto.toFixed(2),
        mov.saldo_actual.toFixed(2)
      ]),
      [],
      ['Resumen del Período'],
      ['Total Ingresos', '', '', resumen.totalIngresos.toFixed(2)],
      ['Total Egresos', '', '', resumen.totalEgresos.toFixed(2)],
      ['Saldo Final', '', '', resumen.saldoFinal.toFixed(2)]
    ];

    const csvContent = rows
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_caja_${fechaInicio}_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reportes de Caja</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={generarReporte}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          {isLoading ? 'Generando...' : 'Generar Reporte'}
        </button>
        {resumen && (
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {resumen && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Total Ingresos</p>
              <p className="text-2xl font-semibold text-green-900">
                ${resumen.totalIngresos.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800">Total Egresos</p>
              <p className="text-2xl font-semibold text-red-900">
                ${resumen.totalEgresos.toFixed(2)}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-indigo-800">Saldo Final</p>
              <p className="text-2xl font-semibold text-indigo-900">
                ${resumen.saldoFinal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumen.movimientos.map((mov, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mov.fecha).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mov.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mov.motivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                        ${mov.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${mov.saldo_actual.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
