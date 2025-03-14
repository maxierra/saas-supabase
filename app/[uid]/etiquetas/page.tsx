'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Barcode from 'react-barcode';

// Interfaz para el tipo de producto
interface Producto {
  id: string;
  uid: string;
  nombre: string;
  precio_venta: number;
  codigo_producto: string;
  codigo_barras: string;
}

export default function EtiquetasPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Estados para el buscador y la generación de etiquetas
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [etiquetas, setEtiquetas] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  
  // Función para buscar un producto por su código
  const buscarProducto = async (codigo?: string) => {
    const codigoABuscar = codigo || codigoProducto;
    if (!codigoABuscar.trim()) {
      setError('Ingrese un código de producto o escanee un código de barras');
      return;
    }

    // Prevenir búsquedas duplicadas
    const now = Date.now();
    if (now - lastSearchTime < 500) {
      console.log('Búsqueda ignorada por debounce');
      return;
    }
    setLastSearchTime(now);
    
    setIsLoading(true);
    setError(null);
    setSearchMessage(null);
    
    try {
      console.log('Buscando producto con código:', codigoABuscar.trim());
      
      // Buscar por código de producto o código de barras
      const { data, error } = await supabase
        .from('productos')
        .select('id, uid, nombre, precio_venta, codigo_producto, codigo_barras')
        .eq('uid', uid)
        .or(`codigo_producto.eq.${codigoABuscar.trim()},codigo_barras.eq.${codigoABuscar.trim()}`)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setSearchMessage('No se encontró ningún producto con ese código');
          setProducto(null);
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Producto encontrado:', data);
        setProducto(data);
        setSearchMessage(`Producto encontrado: ${data.nombre}`);
        // Limpiar el campo de búsqueda para el siguiente escaneo
        setCodigoProducto('');
      }
    } catch (err: any) {
      console.error('Error al buscar producto:', err);
      setError('Error al buscar el producto. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
      // Mantener el foco en el campo de búsqueda para facilitar el escaneo continuo
      searchInputRef.current?.focus();
    }
  };
  
  // Función para generar las etiquetas
  const generarEtiquetas = () => {
    if (!producto) {
      setError('Primero debe buscar y seleccionar un producto');
      return;
    }
    
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    
    // Generar array de etiquetas según la cantidad
    const nuevasEtiquetas = Array(cantidad).fill(producto);
    setEtiquetas(nuevasEtiquetas);
  };
  
  // Función para imprimir las etiquetas
  const handlePrint = () => {
    window.print();
  };
  
  // Función para limpiar todo
  const limpiarTodo = () => {
    setCodigoProducto('');
    setCantidad(1);
    setProducto(null);
    setEtiquetas([]);
    setError(null);
    setSearchMessage(null);
  };
  
  // Formatear precio para mostrar
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generación de Etiquetas</h1>
        <p className="text-sm text-gray-600 mt-1 sm:mt-0">
          ID de usuario: {uid.substring(0, 8)}...
        </p>
      </div>
      
      {/* Sección de búsqueda y configuración */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 print:hidden">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Generar Etiquetas para Productos</h2>
        
        <div className="space-y-4">
          {/* Buscador de productos */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="codigoProducto" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Producto
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="codigoProducto"
                  ref={searchInputRef}
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    console.log('Evento KeyDown:', e.key, 'Tiempo:', new Date().toISOString());
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      console.log('Ejecutando búsqueda desde KeyDown');
                      buscarProducto();
                    }
                  }}
                  placeholder="Escanee código de barras o ingrese código de producto"
                  className="flex-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    console.log('Ejecutando búsqueda desde botón:', new Date().toISOString());
                    buscarProducto();
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>
            
            <div className="sm:w-32">
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          {/* Mensaje de búsqueda */}
          {searchMessage && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">{searchMessage}</p>
            </div>
          )}
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Información del producto encontrado */}
          {producto && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900">Información del Producto</h3>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Código</dt>
                  <dd className="text-sm text-gray-900">{producto.codigo_producto}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="text-sm text-gray-900">{producto.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio</dt>
                  <dd className="text-sm text-gray-900">{formatearPrecio(producto.precio_venta)}</dd>
                </div>
              </dl>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={generarEtiquetas}
              disabled={!producto || isLoading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              Generar Etiquetas
            </button>
            
            <button
              onClick={handlePrint}
              disabled={etiquetas.length === 0 || isLoading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
            >
              Imprimir Etiquetas
            </button>
            
            <button
              onClick={limpiarTodo}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
      
      {/* Vista previa de etiquetas */}
      {etiquetas.length > 0 && (
        <div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 print:shadow-none print:p-0">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h2 className="text-lg font-medium text-gray-900">Vista Previa de Etiquetas</h2>
              <div className="space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Imprimir Etiquetas
                </button>
                <button
                  onClick={limpiarTodo}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Limpiar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-0 print:grid-cols-4">
              {etiquetas.map((etiqueta, index) => (
                <div key={index} className="border rounded-lg p-3 print:border-none print:p-1 flex flex-col items-center justify-center text-center">
                  <div className="text-xs text-gray-500 mb-1">{etiqueta.codigo_producto}</div>
                  <div className="font-medium text-sm mb-2 h-8 flex items-center">{etiqueta.nombre}</div>
                  <div className="scale-75 transform origin-center mb-2">
                    <Barcode 
                      value={etiqueta.codigo_barras || etiqueta.codigo_producto}
                      width={1.5}
                      height={40}
                      fontSize={12}
                      margin={5}
                      displayValue={false}
                    />
                  </div>
                  <div className="text-lg font-bold">{formatearPrecio(etiqueta.precio_venta)}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Estilos específicos para impresión */}
          <style jsx global>{`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .print\\:grid-cols-4 {
                grid-template-columns: repeat(4, 1fr);
              }
              .print\\:border-none {
                border: none !important;
              }
              .print\\:p-1 {
                padding: 0.25rem !important;
              }
              .print\\:shadow-none {
                box-shadow: none !important;
              }
              .print\\:p-0 {
                padding: 0 !important;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
