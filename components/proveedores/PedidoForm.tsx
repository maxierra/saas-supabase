'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Proveedor {
  id: string;
  nombre: string;
}

interface ProductoPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface PedidoFormProps {
  uid: string;
  proveedorId?: string;
  pedidoId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PedidoForm({ uid, proveedorId, pedidoId, onSuccess, onCancel }: PedidoFormProps) {
  const isEditing = !!pedidoId;
  
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<ProductoPedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    proveedor_id: proveedorId || '',
    fecha_pedido: format(new Date(), 'yyyy-MM-dd'),
    fecha_entrega_estimada: '',
    estado: 'pendiente',
    total: 0,
    pagado: false,
    fecha_pago: '',
    notas: '',
  });
  
  const [nuevoProducto, setNuevoProducto] = useState({
    id: '',
    nombre: '',
    cantidad: 1,
    precio_unitario: 0,
  });

  // Cargar proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const { data, error } = await supabase
          .from('proveedores')
          .select('id, nombre')
          .eq('uid', uid)
          .order('nombre');
        
        if (error) throw error;
        setProveedores(data || []);
      } catch (err) {
        console.error('Error al cargar proveedores:', err);
        setError('No se pudieron cargar los proveedores');
      }
    };
    
    fetchProveedores();
  }, [uid]);
  
  // Cargar datos del pedido si estamos editando
  useEffect(() => {
    if (pedidoId) {
      const fetchPedido = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('pedidos_proveedores')
            .select('*')
            .eq('id', pedidoId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormData({
              proveedor_id: data.proveedor_id,
              fecha_pedido: data.fecha_pedido ? format(new Date(data.fecha_pedido), 'yyyy-MM-dd') : '',
              fecha_entrega_estimada: data.fecha_entrega_estimada ? format(new Date(data.fecha_entrega_estimada), 'yyyy-MM-dd') : '',
              estado: data.estado,
              total: data.total,
              pagado: data.pagado,
              fecha_pago: data.fecha_pago ? format(new Date(data.fecha_pago), 'yyyy-MM-dd') : '',
              notas: data.notas || '',
            });
            
            // Cargar productos del pedido
            if (data.detalle_pedido) {
              setProductos(data.detalle_pedido);
            }
          }
        } catch (err) {
          console.error('Error al cargar el pedido:', err);
          setError('No se pudo cargar la información del pedido');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPedido();
    }
  }, [pedidoId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleProductoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'precio_unitario' ? parseFloat(value) || 0 : value
    }));
  };
  
  const agregarProducto = () => {
    if (!nuevoProducto.nombre.trim()) {
      alert('Ingrese el nombre del producto');
      return;
    }
    
    const subtotal = nuevoProducto.cantidad * nuevoProducto.precio_unitario;
    
    const nuevoProductoCompleto = {
      ...nuevoProducto,
      id: nuevoProducto.id || `temp-${Date.now()}`,
      subtotal
    };
    
    setProductos([...productos, nuevoProductoCompleto]);
    
    // Actualizar el total
    const nuevoTotal = formData.total + subtotal;
    setFormData(prev => ({
      ...prev,
      total: nuevoTotal
    }));
    
    // Limpiar el formulario de nuevo producto
    setNuevoProducto({
      id: '',
      nombre: '',
      cantidad: 1,
      precio_unitario: 0
    });
  };
  
  const eliminarProducto = (index: number) => {
    const productoEliminado = productos[index];
    const nuevosProductos = [...productos];
    nuevosProductos.splice(index, 1);
    
    setProductos(nuevosProductos);
    
    // Actualizar el total
    const nuevoTotal = formData.total - productoEliminado.subtotal;
    setFormData(prev => ({
      ...prev,
      total: nuevoTotal
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proveedor_id) {
      setError('Selecciona un proveedor');
      return;
    }
    
    if (productos.length === 0) {
      setError('Agrega al menos un producto al pedido');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const pedidoData = {
        uid,
        proveedor_id: formData.proveedor_id,
        fecha_pedido: formData.fecha_pedido ? new Date(formData.fecha_pedido).toISOString() : null,
        fecha_entrega_estimada: formData.fecha_entrega_estimada ? new Date(formData.fecha_entrega_estimada).toISOString() : null,
        estado: formData.estado,
        total: formData.total,
        pagado: formData.pagado,
        fecha_pago: formData.pagado && formData.fecha_pago ? new Date(formData.fecha_pago).toISOString() : null,
        notas: formData.notas,
        detalle_pedido: productos
      };
      
      if (isEditing) {
        // Actualizar pedido existente
        const { error: updateError } = await supabase
          .from('pedidos_proveedores')
          .update(pedidoData)
          .eq('id', pedidoId);
          
        if (updateError) throw updateError;
      } else {
        // Crear nuevo pedido
        const { error: insertError } = await supabase
          .from('pedidos_proveedores')
          .insert(pedidoData);
          
        if (insertError) throw insertError;
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar el pedido:', err);
      setError(err.message || 'Error al guardar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Información del Pedido</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa los detalles básicos del pedido al proveedor.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="proveedor_id" className="block text-sm font-medium text-gray-700">
                  Proveedor *
                </label>
                <select
                  id="proveedor_id"
                  name="proveedor_id"
                  value={formData.proveedor_id}
                  onChange={handleChange}
                  disabled={!!proveedorId}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="fecha_pedido" className="block text-sm font-medium text-gray-700">
                  Fecha del Pedido *
                </label>
                <input
                  type="date"
                  name="fecha_pedido"
                  id="fecha_pedido"
                  value={formData.fecha_pedido}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="fecha_entrega_estimada" className="block text-sm font-medium text-gray-700">
                  Fecha de Entrega Estimada
                </label>
                <input
                  type="date"
                  name="fecha_entrega_estimada"
                  id="fecha_entrega_estimada"
                  value={formData.fecha_entrega_estimada}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado del Pedido *
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en curso">En Curso</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="pagado"
                      name="pagado"
                      type="checkbox"
                      checked={formData.pagado}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pagado" className="font-medium text-gray-700">
                      Pedido Pagado
                    </label>
                    <p className="text-gray-500">Marca esta casilla si ya has pagado este pedido.</p>
                  </div>
                </div>
              </div>

              {formData.pagado && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    name="fecha_pago"
                    id="fecha_pago"
                    value={formData.fecha_pago}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div className="col-span-6">
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                  Notas
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={formData.notas}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Notas adicionales sobre el pedido..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Productos del Pedido</h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega los productos que incluye este pedido.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6 mb-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleProductoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-1">
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  name="cantidad"
                  id="cantidad"
                  min="1"
                  step="1"
                  value={nuevoProducto.cantidad}
                  onChange={handleProductoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700">
                  Precio Unitario
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="precio_unitario"
                    id="precio_unitario"
                    min="0"
                    step="0.01"
                    value={nuevoProducto.precio_unitario}
                    onChange={handleProductoChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="col-span-6 sm:col-span-6 flex justify-end">
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Agregar Producto
                </button>
              </div>
            </div>

            {/* Lista de productos */}
            {productos.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Productos Agregados</h4>
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
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productos.map((producto, index) => (
                        <tr key={producto.id}>
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => eliminarProducto(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${formData.total.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">No hay productos agregados al pedido</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Pedido' : 'Crear Pedido'}
        </button>
      </div>
    </form>
  );
}
