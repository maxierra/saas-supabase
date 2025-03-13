'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import MovimientoCajaModal from '@/components/modals/MovimientoCajaModal';
import ReportesCajaModal from '@/components/modals/ReportesCajaModal';

interface Movimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  motivo: string;
  monto: number;
  venta_id: string | null;
  saldo_anterior: number;
  saldo_actual: number;
}

export default function CajaPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [isReportesModalOpen, setIsReportesModalOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState<'ingreso' | 'egreso'>('ingreso');
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<string>('');

  const loadMovimientos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Crear fechas en UTC para la consulta
      const startDate = new Date(selectedDate);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setUTCHours(23, 59, 59, 999);

      console.log('Consultando movimientos entre:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Obtener todos los movimientos del día
      const { data: movimientosData, error: movimientosError } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('uid', uid)
        .gte('fecha', startDate.toISOString())
        .lte('fecha', endDate.toISOString())
        .order('fecha', { ascending: false });

      if (movimientosError) {
        console.error('Error al cargar movimientos:', movimientosError);
        setError('Error al cargar los movimientos. Por favor, intenta de nuevo.');
        return;
      }

      console.log('Movimientos encontrados:', movimientosData?.length || 0, movimientosData);
      setMovimientos(movimientosData || []);

      // Obtener el último movimiento para el saldo actual
      const { data: ultimoMovimiento, error: ultimoError } = await supabase
        .from('movimientos_caja')
        .select('saldo_actual')
        .eq('uid', uid)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (ultimoError && ultimoError.code !== 'PGRST116') {
        console.error('Error al obtener último movimiento:', ultimoError);
      } else {
        console.log('Último movimiento:', ultimoMovimiento);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar los movimientos.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, uid]);

  useEffect(() => {
    loadMovimientos();
    
    // Configurar la fecha actual para el título
    const today = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[today.getDay()];
    setCurrentDay(dayName);
    
    const formattedDate = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, [loadMovimientos, selectedDate]);

  // Calcular saldos del día
  const movimientosDelDia = movimientos || [];
  
  const ingresos = movimientosDelDia
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0);
  
  const egresos = movimientosDelDia
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  // Asegurarse de que el saldo actual refleje los movimientos del día
  const handleOpenMovimientoModal = (tipo: 'ingreso' | 'egreso') => {
    setTipoMovimiento(tipo);
    setIsMovimientoModalOpen(true);
  };

  const handleMovimientoComplete = () => {
    loadMovimientos();
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gestión de Caja | {currentDay} {currentDate}
        </h1>
        <button
          onClick={() => setIsReportesModalOpen(true)}
          className="mt-2 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Generar Reportes
        </button>
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
              <p className="text-xl font-semibold text-gray-900">${(ingresos - egresos).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de Caja */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button 
          onClick={() => handleOpenMovimientoModal('ingreso')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Ingreso
        </button>
        <button 
          onClick={() => handleOpenMovimientoModal('egreso')}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Registrar Egreso
        </button>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Movimientos del Día</h2>
            <div className="flex items-center">
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 mr-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                    No hay movimientos registrados para esta fecha
                  </td>
                </tr>
              ) : (
                movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movimiento.fecha).toLocaleTimeString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movimiento.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                        ${movimiento.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.motivo}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${movimiento.saldo_actual.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MovimientoCajaModal
        isOpen={isMovimientoModalOpen}
        onClose={() => setIsMovimientoModalOpen(false)}
        uid={uid}
        tipo={tipoMovimiento}
        saldoActual={ingresos - egresos}
        onMovimientoComplete={handleMovimientoComplete}
      />

      <ReportesCajaModal
        isOpen={isReportesModalOpen}
        onClose={() => setIsReportesModalOpen(false)}
        uid={uid}
      />
    </div>
  );
}
