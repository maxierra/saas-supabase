'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SalesHistoryModal from '@/components/modals/SalesHistoryModal';
import QuickSearchProductoPeso from '@/components/modals/QuickSearchProductoPeso';
import TicketModal from '@/components/modals/TicketModal';
import GramosInputModal from '@/components/modals/GramosInputModal';

interface ProductoEnVenta {
  id: string;
  codigo_producto: string;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  subtotal: number;
  es_peso?: boolean;
  gramos?: number;
  precio_por_gramo?: number;
}

export default function VentasPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [productos, setProductos] = useState<ProductoEnVenta[]>([]);
  const [total, setTotal] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  
  // Estados para el ticket
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [datosComercio, setDatosComercio] = useState<any>(null);
  const [numeroTicket, setNumeroTicket] = useState(0);
  const [productosTicket, setProductosTicket] = useState<any[]>([]);
  const [metodoPagoTicket, setMetodoPagoTicket] = useState('efectivo');
  const [totalTicket, setTotalTicket] = useState(0);

  // Estados para el modal de selección de gramos
  const [isGramosModalOpen, setIsGramosModalOpen] = useState(false);
  const [selectedWeightProduct, setSelectedWeightProduct] = useState<any>(null);

  const handleWeightProductSelect = (weightProduct: any) => {
    // Guardar el producto seleccionado y abrir el modal de gramos
    setSelectedWeightProduct(weightProduct);
    setIsGramosModalOpen(true);
  };

  // Manejar la confirmación de gramos desde el modal
  const handleGramosConfirm = (gramos: number) => {
    if (!selectedWeightProduct) return;
    
    const subtotal = parseFloat((selectedWeightProduct.precio_venta_gramo * gramos).toFixed(2));

    const newProduct: ProductoEnVenta = {
      id: selectedWeightProduct.id,
      codigo_producto: selectedWeightProduct.codigo_producto,
      nombre: selectedWeightProduct.nombre,
      precio_venta: parseFloat(selectedWeightProduct.precio_venta_gramo.toFixed(2)),
      cantidad: 1,
      subtotal: subtotal,
      es_peso: true,
      gramos: gramos,
      precio_por_gramo: parseFloat(selectedWeightProduct.precio_venta_gramo.toFixed(2))
    };

    setProductos([...productos, newProduct]);
    setIsQuickSearchOpen(false);
    setError(null);
    setSelectedWeightProduct(null);
  };

  // Actualizar total cuando cambian los productos
  useEffect(() => {
    const newTotal = productos.reduce((sum, product) => sum + product.subtotal, 0);
    setTotal(newTotal);
  }, [productos]);

  // Cargar datos del comercio
  useEffect(() => {
    const loadDatosComercio = async () => {
      try {
        const { data, error } = await supabase
          .from('datos_comercio')
          .select('*')
          .eq('uid', uid)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error al cargar datos del comercio:', error);
          return;
        }
        
        if (data) {
          setDatosComercio(data);
          setNumeroTicket(data.numero_facturacion || 1);
        }
      } catch (err) {
        console.error('Error al cargar datos del comercio:', err);
      }
    };
    
    loadDatosComercio();
  }, [uid]);

  // Buscar producto por código
  const searchProduct = async () => {
    if (!searchCode.trim()) return;

    try {
      // Primero buscar en productos regulares
      const { data: regularProduct, error: regularError } = await supabase
        .from('productos')
        .select('*')
        .eq('uid', uid)
        .eq('codigo_producto', searchCode.trim())
        .maybeSingle();

      if (regularError) throw regularError;

      // Si no se encuentra en productos regulares, buscar en productos_peso
      if (!regularProduct) {
        const { data: weightProduct, error: weightError } = await supabase
          .from('productos_peso')
          .select('*')
          .eq('uid', uid)
          .eq('codigo_producto', searchCode.trim())
          .single();

        if (weightError) {
          if (weightError.code === 'PGRST116') {
            setError('Producto no encontrado');
            return;
          }
          throw weightError;
        }

        if (weightProduct) {
          // Mostrar modal para ingresar gramos
          setSelectedWeightProduct(weightProduct);
          setIsGramosModalOpen(true);
          return;
        }

        setError('Producto no encontrado');
        return;
      }

      // Procesar producto regular
      const existingProduct = productos.find(p => p.codigo_producto === regularProduct.codigo_producto);
      if (existingProduct) {
        updateQuantity(existingProduct.codigo_producto, existingProduct.cantidad + 1);
      } else {
        const newProduct: ProductoEnVenta = {
          id: regularProduct.id,
          codigo_producto: regularProduct.codigo_producto,
          nombre: regularProduct.nombre,
          precio_venta: regularProduct.precio_venta,
          cantidad: 1,
          subtotal: regularProduct.precio_venta
        };
        setProductos([...productos, newProduct]);
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
  };

  // Eliminar producto de la venta
  const removeProduct = (codigo_producto: string) => {
    setProductos(productos.filter(p => p.codigo_producto !== codigo_producto));
  };

  // Finalizar venta
  const handleSubmit = async () => {
    if (productos.length === 0) {
      setError('Agrega al menos un producto para realizar la venta');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar stock suficiente para cada producto
      for (const producto of productos) {
        if (producto.es_peso) {
          // Verificar stock para productos por peso
          const { data: stockData, error: stockError } = await supabase
            .from('productos_peso')
            .select('stock_gramos')
            .eq('id', producto.id)
            .eq('uid', uid)
            .single();

          if (stockError) throw stockError;

          if (!stockData || stockData.stock_gramos < (producto.gramos || 0)) {
            setError(`Stock insuficiente para el producto ${producto.nombre}`);
            return;
          }
        } else {
          // Verificar stock para productos regulares
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
        precio_unitario: producto.es_peso ? producto.precio_por_gramo : producto.precio_venta,
        cantidad: producto.es_peso ? producto.gramos : producto.cantidad,
        subtotal: producto.subtotal,
        es_peso: producto.es_peso || false
      }));

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detalles);

      if (detallesError) throw detallesError;

      // Actualizar el stock de los productos
      for (const producto of productos) {
        if (producto.es_peso) {
          // Actualizar stock de productos por peso
          const { data: currentStock } = await supabase
            .from('productos_peso')
            .select('stock_gramos')
            .eq('id', producto.id)
            .single();

          const { error: updateError } = await supabase
            .from('productos_peso')
            .update({ stock_gramos: (currentStock?.stock_gramos || 0) - (producto.gramos || 0) })
            .eq('id', producto.id)
            .eq('uid', uid);

          if (updateError) throw updateError;
        } else {
          // Actualizar stock de productos regulares
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
      }

      // Registrar el ingreso en la caja
      const { data: ultimoMovimiento } = await supabase
        .from('movimientos_caja')
        .select('saldo_actual')
        .eq('uid', uid)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      const saldoAnterior = ultimoMovimiento?.saldo_actual || 0;
      const saldoActual = saldoAnterior + total;

      const fechaActual = new Date().toISOString();
      console.log('Registrando movimiento de caja con fecha:', fechaActual);

      // Registrar el ingreso por la venta
      const { error: ingresoError } = await supabase
        .from('movimientos_caja')
        .insert({
          uid,
          tipo: 'ingreso',
          motivo: `Venta #${ventaData.id.substring(0, 8)}`,
          monto: total,
          venta_id: ventaData.id,
          saldo_anterior: saldoAnterior,
          saldo_actual: saldoActual,
          fecha: fechaActual
        });

      if (ingresoError) {
        console.error('Error al registrar ingreso:', ingresoError);
        throw ingresoError;
      }

      // Si es en efectivo y hay vuelto, registrar el egreso
      if (metodoPago === 'efectivo' && montoRecibido) {
        const vuelto = Number(montoRecibido) - total;
        if (vuelto > 0) {
          const { error: vueltoError } = await supabase
            .from('movimientos_caja')
            .insert({
              uid,
              tipo: 'egreso',
              motivo: `Vuelto venta #${ventaData.id.substring(0, 8)}`,
              monto: vuelto,
              venta_id: ventaData.id,
              saldo_anterior: saldoActual,
              saldo_actual: saldoActual - vuelto,
              fecha: fechaActual
            });

          if (vueltoError) {
            console.error('Error al registrar vuelto:', vueltoError);
            throw vueltoError;
          }
        }
      }

      // Incrementar el número de facturación en datos_comercio
      if (datosComercio) {
        const nuevoNumero = (datosComercio.numero_facturacion || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('datos_comercio')
          .update({ 
            numero_facturacion: nuevoNumero,
            updated_at: new Date().toISOString()
          })
          .eq('id', datosComercio.id)
          .eq('uid', uid);
          
        if (updateError) {
          console.error('Error al actualizar número de facturación:', updateError);
        } else {
          setNumeroTicket(nuevoNumero);
        }
      }

      // Preparar datos para el ticket
      setProductosTicket(detalles);
      
      // Guardar el método de pago actual para el ticket
      setMetodoPagoTicket(metodoPago);
      
      // Guardar el total actual para el ticket
      setTotalTicket(total);
      
      // Preguntar si desea imprimir el ticket
      const imprimirTicket = confirm('Venta registrada con éxito. ¿Desea imprimir el ticket?');
      
      // Limpiar el formulario
      setProductos([]);
      setMetodoPago('efectivo');
      setMontoRecibido('');
      setError(null);
      
      // Mostrar modal de ticket si el usuario quiere imprimir
      if (imprimirTicket) {
        setIsTicketModalOpen(true);
      }
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      setError('Error al procesar la venta. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Punto de Venta</h1>
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Ver Ventas del Día
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Búsqueda y lista de productos */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
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
              <button
                onClick={() => setIsQuickSearchOpen(!isQuickSearchOpen)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                title="Buscar productos por peso (fiambres, etc.)"
              >
                Productos por Peso
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {isQuickSearchOpen && (
              <div className="mt-4 p-5 border rounded-lg bg-gradient-to-r from-green-50 to-green-100 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-green-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.172 9H3.1a6.995 6.995 0 016.29-6.929v2.332a5 5 0 00-4.218 4.597zm.413 1h2.614a3 3 0 005.602 0h2.614a5 5 0 01-10.83 0zm10.315-1h-2.073a5 5 0 00-4.217-4.597V2.07A6.995 6.995 0 0115.9 9z" clipRule="evenodd" />
                    </svg>
                    Buscar Productos por Peso
                  </h3>
                  <button 
                    onClick={() => setIsQuickSearchOpen(false)}
                    className="text-green-700 hover:text-green-900 transition-colors"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <QuickSearchProductoPeso
                  uid={uid}
                  onProductSelect={handleWeightProductSelect}
                />
              </div>
            )}

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
                    <tr key={`${producto.codigo_producto}-${producto.es_peso ? producto.gramos : producto.cantidad}-${Date.now()}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {producto.codigo_producto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.es_peso
                          ? `$${producto.precio_por_gramo?.toFixed(2) || '0.00'}/g`
                          : `$${producto.precio_venta.toFixed(2)}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.es_peso ? (
                          <span>{producto.gramos}g</span>
                        ) : (
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
                        )}
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
          </div>
        </div>

        {/* Panel derecho: Resumen y finalización */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de Venta</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => {
                  setMetodoPago(e.target.value);
                  if (e.target.value !== 'efectivo') {
                    setMontoRecibido('');
                  }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
                <option value="tarjeta_debito">Tarjeta de Débito</option>
                <option value="mercado_pago">Mercado Pago</option>
              </select>
            </div>

            {metodoPago === 'efectivo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto recibido</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
                {montoRecibido && Number(montoRecibido) >= total && (
                  <div className="mt-2 text-sm text-gray-600">
                    Vuelto: ${(Number(montoRecibido) - total).toFixed(2)}
                  </div>
                )}
                {montoRecibido && Number(montoRecibido) < total && (
                  <div className="mt-2 text-sm text-red-600">
                    El monto recibido es menor al total
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                productos.length === 0 || 
                (metodoPago === 'efectivo' && (!montoRecibido || Number(montoRecibido) < total))
              }
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Procesando...' : 'Finalizar Venta'}
            </button>
          </div>
        </div>
      </div>

      <SalesHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        uid={uid}
      />
      
      {/* Modal de Ticket */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        productos={productosTicket}
        total={totalTicket}
        metodoPago={metodoPagoTicket}
        datosComercio={datosComercio}
        numeroTicket={numeroTicket}
      />

      {/* Modal de selección de gramos */}
      <GramosInputModal
        isOpen={isGramosModalOpen}
        onClose={() => setIsGramosModalOpen(false)}
        onConfirm={handleGramosConfirm}
        productoNombre={selectedWeightProduct?.nombre || ''}
        precioPorGramo={selectedWeightProduct?.precio_venta_gramo || 0}
      />
    </div>
  );
}
