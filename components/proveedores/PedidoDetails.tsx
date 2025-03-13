'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Pedido {
  id: string;
  proveedor_id: string;
  fecha_pedido: string;
  fecha_entrega_estimada: string | null;
  fecha_entrega_real: string | null;
  estado: string;
  total: number;
  pagado: boolean;
  fecha_pago: string | null;
  notas: string;
  detalle_pedido: ProductoPedido[];
  created_at: string;
  updated_at: string;
  proveedor_nombre?: string;
}

interface ProductoPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface PedidoDetailsProps {
  uid: string;
  pedidoId: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function PedidoDetails({ uid, pedidoId, onClose, onEdit }: PedidoDetailsProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('pedidos_proveedores')
          .select(`
            *,
            proveedores(nombre)
          `)
          .eq('id', pedidoId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setPedido({
            ...data,
            proveedor_nombre: data.proveedores?.nombre
          });
        }
      } catch (err: any) {
        console.error('Error al cargar el pedido:', err);
        setError('No se pudo cargar la información del pedido');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPedido();
  }, [pedidoId]);

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (!pedido) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('pedidos_proveedores')
        .update({ 
          estado: nuevoEstado,
          // Si el estado es "entregado", actualizar la fecha de entrega real
          ...(nuevoEstado === 'entregado' && { fecha_entrega_real: new Date().toISOString() })
        })
        .eq('id', pedidoId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setPedido({
        ...pedido,
        estado: nuevoEstado,
        ...(nuevoEstado === 'entregado' && { fecha_entrega_real: new Date().toISOString() })
      });
      
    } catch (err: any) {
      console.error('Error al actualizar el estado:', err);
      alert('Error al actualizar el estado del pedido: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePagoToggle = async () => {
    if (!pedido) return;
    
    setIsUpdating(true);
    
    try {
      const nuevoPagado = !pedido.pagado;
      
      const { error } = await supabase
        .from('pedidos_proveedores')
        .update({ 
          pagado: nuevoPagado,
          fecha_pago: nuevoPagado ? new Date().toISOString() : null
        })
        .eq('id', pedidoId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setPedido({
        ...pedido,
        pagado: nuevoPagado,
        fecha_pago: nuevoPagado ? new Date().toISOString() : null
      });
      
    } catch (err: any) {
      console.error('Error al actualizar el pago:', err);
      alert('Error al actualizar el estado de pago: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en curso':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'No se encontró el pedido'}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detalles del Pedido
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Información completa del pedido a {pedido.proveedor_nombre}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Editar
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Proveedor</dt>
            <dd className="mt-1 text-sm text-gray-900">{pedido.proveedor_nombre}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Fecha del Pedido</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {pedido.fecha_pedido ? format(new Date(pedido.fecha_pedido), 'dd/MM/yyyy') : 'No disponible'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                  {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
                <div className="ml-4">
                  <select
                    value={pedido.estado}
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    disabled={isUpdating}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en curso">En Curso</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Pago</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pedido.pagado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {pedido.pagado ? 'Pagado' : 'No pagado'}
                </span>
                <button
                  onClick={handlePagoToggle}
                  disabled={isUpdating}
                  className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {pedido.pagado ? 'Marcar como no pagado' : 'Marcar como pagado'}
                </button>
              </div>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Fecha de Entrega Estimada</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {pedido.fecha_entrega_estimada ? format(new Date(pedido.fecha_entrega_estimada), 'dd/MM/yyyy') : 'No especificada'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Fecha de Entrega Real</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {pedido.fecha_entrega_real ? format(new Date(pedido.fecha_entrega_real), 'dd/MM/yyyy') : 'No entregado aún'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Fecha de Pago</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {pedido.fecha_pago ? format(new Date(pedido.fecha_pago), 'dd/MM/yyyy') : 'No pagado aún'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total</dt>
            <dd className="mt-1 text-sm text-gray-900 font-bold">${pedido.total.toFixed(2)}</dd>
          </div>
          
          {pedido.notas && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notas</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{pedido.notas}</dd>
            </div>
          )}
        </dl>
      </div>
      
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Productos del Pedido</h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedido.detalle_pedido.map((producto, index) => (
                <tr key={producto.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {producto.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {producto.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${producto.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${producto.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${pedido.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
