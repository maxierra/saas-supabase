'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QuickSearchProductoPeso from './QuickSearchProductoPeso';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleComplete: () => void;
  uid: string;
}

interface ProductInSale {
  id: string;
  codigo_producto: string;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  subtotal: number;
  es_peso?: boolean;
  peso_gramos?: number;
}

const SaleModal = ({ isOpen, onClose, onSaleComplete, uid }: SaleModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [productos, setProductos] = useState<ProductInSale[]>([]);
  const [total, setTotal] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [error, setError] = useState<string | null>(null);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
    if (!isOpen) {
      // Resetear el estado cuando se cierra el modal
      setSearchCode('');
      setProductos([]);
      setTotal(0);
      setMetodoPago('efectivo');
      setError(null);
      setShowQuickSearch(false);
    }
  }, [isOpen]);

  // Manejar la selección de producto por peso
  const handleProductoPesoSelect = async (producto: any) => {
    const pesoGramos = prompt('Ingrese el peso en gramos:');
    if (!pesoGramos || isNaN(Number(pesoGramos)) || Number(pesoGramos) <= 0) {
      setError('Por favor ingrese un peso válido');
      return;
    }

    const peso = Number(pesoGramos);
    const subtotal = peso * producto.precio_venta_gramo;

    const newProduct: ProductInSale = {
      id: producto.id,
      codigo_producto: producto.codigo_producto,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta_gramo,
      cantidad: 1,
      subtotal: subtotal,
      es_peso: true,
      peso_gramos: peso
    };

    setProductos([...productos, newProduct]);
    updateTotal([...productos, newProduct]);
    setShowQuickSearch(false);
    setError(null);
  };

  // Buscar producto por código
  const searchProduct = async () => {
    if (!searchCode.trim()) return;

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('uid', uid)
        .eq('codigo_producto', searchCode.trim())
        .single();

      if (error) throw error;

      if (!data) {
        setError('Producto no encontrado');
        return;
      }

      // Verificar si el producto ya está en la lista
      const existingProduct = productos.find(p => p.codigo_producto === data.codigo_producto);
      if (existingProduct) {
        // Incrementar cantidad si ya existe
        updateQuantity(existingProduct.codigo_producto, existingProduct.cantidad + 1);
      } else {
        // Agregar nuevo producto
        const newProduct: ProductInSale = {
          id: data.id,
          codigo_producto: data.codigo_producto,
          nombre: data.nombre,
          precio_venta: data.precio_venta,
          cantidad: 1,
          subtotal: data.precio_venta
        };
        setProductos([...productos, newProduct]);
        updateTotal([...productos, newProduct]);
      }

      setSearchCode('');
      setError(null);
    } catch (err) {
      console.error('Error al buscar producto:', err);
      setError('Error al buscar el producto');
    }
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (codigo_producto: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedProducts = productos.map(producto => {
      if (producto.codigo_producto === codigo_producto) {
        return {
          ...producto,
          cantidad: newQuantity,
          subtotal: producto.precio_venta * newQuantity
        };
      }
      return producto;
    });

    setProductos(updatedProducts);
    updateTotal(updatedProducts);
  };

  // Eliminar producto de la venta
  const removeProduct = (codigo_producto: string) => {
    const updatedProducts = productos.filter(p => p.codigo_producto !== codigo_producto);
    setProductos(updatedProducts);
    updateTotal(updatedProducts);
  };

  // Actualizar total
  const updateTotal = (products: ProductInSale[]) => {
    const newTotal = products.reduce((sum, product) => sum + product.subtotal, 0);
    setTotal(newTotal);
  };

  // Finalizar venta
  const handleSubmit = async () => {
    if (productos.length === 0) {
      setError('Agrega al menos un producto para realizar la venta');
      return;
    }

    setIsSubmitting(true);

    try {
      // Primero verificar que hay stock suficiente
      for (const producto of productos) {
        const { data: stockData, error: stockError } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', producto.id)
          .eq('uid', uid)
          .single();

        if (stockError) throw stockError;

        if (!stockData || stockData.stock < producto.cantidad) {
          setError(`Stock insuficiente para el producto ${producto.nombre}`);
          return;
        }
      }

      // Insertar la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert({
          uid,
          total,
          metodo_pago: metodoPago,
          fecha: new Date().toISOString()
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Insertar los detalles de la venta
      const detalles = productos.map(producto => ({
        venta_id: ventaData.id,
        producto_id: producto.id,
        codigo_producto: producto.codigo_producto,
        nombre_producto: producto.nombre,
        precio_unitario: producto.precio_venta,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal
      }));

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detalles);

      if (detallesError) throw detallesError;

      // Actualizar el stock de los productos
      for (const producto of productos) {
        const { data: currentStock } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', producto.id)
          .single();

        const { error: updateError } = await supabase
          .from('productos')
          .update({ stock: (currentStock?.stock || 0) - producto.cantidad })
          .eq('id', producto.id)
          .eq('uid', uid);

        if (updateError) throw updateError;
      }

      onSaleComplete();
      onClose();
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      setError('Error al procesar la venta. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Nueva Venta
                </h3>
                
                {/* Buscador de productos */}
                <div className="mt-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShowQuickSearch(false)}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${!showQuickSearch ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      Producto Normal
                    </button>
                    <button
                      onClick={() => setShowQuickSearch(true)}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${showQuickSearch ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      Producto por Peso
                    </button>
                  </div>
                  
                  {!showQuickSearch ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchProduct()}
                        placeholder="Ingrese código de producto"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <button
                        onClick={searchProduct}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Buscar
                      </button>
                    </div>
                  ) : (
                    <QuickSearchProductoPeso
                      uid={uid}
                      onProductSelect={handleProductoPesoSelect}
                    />
                  )}
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                {/* Tabla de productos */}
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productos.map((producto) => (
                        <tr key={producto.codigo_producto}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {producto.codigo_producto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {producto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${producto.precio_venta.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(producto.codigo_producto, producto.cantidad - 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                -
                              </button>
                              <span>{producto.cantidad}</span>
                              <button
                                onClick={() => updateQuantity(producto.codigo_producto, producto.cantidad + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${producto.subtotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removeProduct(producto.codigo_producto)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumen y método de pago */}
                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta_credito">Tarjeta de Crédito</option>
                      <option value="tarjeta_debito">Tarjeta de Débito</option>
                      <option value="mercado_pago">Mercado Pago</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-medium text-gray-900">Total: ${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || productos.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
            >
              {isSubmitting ? 'Procesando...' : 'Finalizar Venta'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
