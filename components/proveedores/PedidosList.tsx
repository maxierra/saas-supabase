'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Pedido {
  id: string;
  proveedor_id: string;
  proveedor_nombre?: string;
  fecha_pedido: string;
  fecha_entrega_estimada: string | null;
  fecha_entrega_real: string | null;
  estado: string;
  total: number;
  pagado: boolean;
  fecha_pago: string | null;
  detalle_pedido: any[];
  created_at: string;
}

interface PedidosListProps {
  uid: string;
  proveedorId?: string;
  onEdit: (pedidoId: string) => void;
  onDelete: (pedidoId: string) => void;
  onView: (pedidoId: string) => void;
  refreshTrigger?: number;
}

export default function PedidosList({ uid, proveedorId, onEdit, onDelete, onView, refreshTrigger = 0 }: PedidosListProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPagado, setFiltroPagado] = useState<string>('todos');

  const fetchPedidos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('pedidos_proveedores')
        .select(`
          *,
          proveedores(nombre)
        `)
        .eq('uid', uid);
      
      if (proveedorId) {
        query = query.eq('proveedor_id', proveedorId);
      }
      
      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado);
      }
      
      if (filtroPagado !== 'todos') {
        query = query.eq('pagado', filtroPagado === 'pagado');
      }
      
      query = query.order('fecha_pedido', { ascending: false });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Formatear los datos para mostrarlos
      const pedidosFormateados = data?.map(pedido => ({
        ...pedido,
        proveedor_nombre: pedido.proveedores?.nombre
      })) || [];
      
      setPedidos(pedidosFormateados);
    } catch (err: any) {
      console.error('Error al cargar pedidos:', err);
      setError('Error al cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [uid, proveedorId, filtroEstado, filtroPagado, refreshTrigger]);

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase
          .from('pedidos_proveedores')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Actualizar la lista después de eliminar
        setPedidos(pedidos.filter(p => p.id !== id));
        
      } catch (err: any) {
        console.error('Error al eliminar pedido:', err);
        alert('Error al eliminar el pedido: ' + err.message);
      }
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

  if (error) {
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
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={fetchPedidos}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h3 className="text-lg font-medium text-gray-900">
          {proveedorId ? 'Pedidos de este Proveedor' : 'Todos los Pedidos'}
        </h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div>
            <label htmlFor="filtroEstado" className="sr-only">Filtrar por Estado</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en curso">En Curso</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filtroPagado" className="sr-only">Filtrar por Pago</label>
            <select
              id="filtroPagado"
              value={filtroPagado}
              onChange={(e) => setFiltroPagado(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="todos">Todos (pagados y no pagados)</option>
              <option value="pagado">Pagados</option>
              <option value="no_pagado">No Pagados</option>
            </select>
          </div>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filtroEstado !== 'todos' || filtroPagado !== 'todos' 
              ? 'No se encontraron pedidos con los filtros seleccionados.' 
              : 'Comienza creando un nuevo pedido.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <li key={pedido.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="truncate text-sm font-medium text-indigo-600 cursor-pointer" onClick={() => onView(pedido.id)}>
                          Pedido del {pedido.fecha_pedido ? format(new Date(pedido.fecha_pedido), 'dd/MM/yyyy') : 'fecha no disponible'}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                          {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                        </p>
                        {pedido.pagado && (
                          <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Pagado
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {!proveedorId && pedido.proveedor_nombre && (
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
                            </svg>
                            {pedido.proveedor_nombre}
                          </p>
                        )}
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          ${pedido.total.toFixed(2)}
                        </p>
                        {pedido.fecha_entrega_estimada && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Entrega est.: {format(new Date(pedido.fecha_entrega_estimada), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onView(pedido.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => onEdit(pedido.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pedido.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
