'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
}

interface Venta {
  id: string;
  fecha: string;
  total: number;
  metodo_pago: string;
  detalle_ventas: {
    cantidad: number;
    nombre_producto: string;
    precio_unitario: number;
  }[];
}

export default function SalesHistoryModal({ isOpen, onClose, uid }: SalesHistoryModalProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVentasDelDia = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('ventas')
        .select(`
          id,
          fecha,
          total,
          metodo_pago,
          detalle_ventas (
            cantidad,
            nombre_producto,
            precio_unitario
          )
        `)
        .eq('uid', uid)
        .gte('fecha', today.toISOString())
        .order('fecha', { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (isOpen) {
      loadVentasDelDia();
    }
  }, [isOpen, loadVentasDelDia]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ventas del Día
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-4">Cargando ventas...</div>
                ) : ventas.length === 0 ? (
                  <div className="text-center py-4">No hay ventas registradas hoy</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hora
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Productos
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Método
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ventas.map((venta: Venta) => (
                          <tr key={venta.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(venta.fecha).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {venta.detalle_ventas.map((detalle) => (
                                `${detalle.cantidad}x ${detalle.nombre_producto}`
                              )).join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${venta.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {venta.metodo_pago.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
