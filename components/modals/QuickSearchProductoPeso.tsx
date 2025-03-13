'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProductoPeso {
  id: string;
  uid: string;
  nombre: string;
  precio_compra_gramo: number;
  precio_venta_gramo: number;
  profit: number;
  stock_gramos: number;
  categoria: string;
  created_at: string;
  codigo_producto: string;
}

interface QuickSearchProductoPesoProps {
  uid: string;
  onProductSelect: (product: ProductoPeso) => void;
}

const QuickSearchProductoPeso = ({ uid, onProductSelect }: QuickSearchProductoPesoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<ProductoPeso[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar categorías únicas
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from('productos_peso')
          .select('categoria')
          .eq('uid', uid)
          .order('categoria');

        if (error) throw error;

        const uniqueCategorias = [...new Set(data.map(item => item.categoria))];
        setCategorias(uniqueCategorias);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    loadCategorias();
  }, [uid]);

  // Buscar productos por nombre o categoría
  useEffect(() => {
    const searchProducts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('productos_peso')
          .select('*')
          .eq('uid', uid);

        if (selectedCategoria) {
          query = query.eq('categoria', selectedCategoria);
        }

        if (searchTerm) {
          query = query.ilike('nombre', `%${searchTerm}%`);
        }

        const { data, error } = await query.order('nombre');

        if (error) throw error;

        setProductos(data || []);
      } catch (err) {
        console.error('Error al buscar productos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [uid, searchTerm, selectedCategoria]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Selector de categoría */}
        <select
          value={selectedCategoria}
          onChange={(e) => setSelectedCategoria(e.target.value)}
          className="w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        {/* Búsqueda por nombre */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-2/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
        />
      </div>

      {/* Lista de productos */}
      <div className="max-h-60 overflow-y-auto rounded-md shadow-md border border-gray-200">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </div>
        ) : productos.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {productos.map((producto, index) => (
              <button
                key={producto.id}
                onClick={() => onProductSelect(producto)}
                className={`w-full px-4 py-3 text-left hover:bg-green-50 flex justify-between items-center transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{producto.nombre}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {producto.categoria}
                    </span>
                    <span className="ml-2 text-gray-400">Cód: {producto.codigo_producto}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">${producto.precio_venta_gramo.toFixed(2)}/g</span>
                  {producto.stock_gramos && (
                    <div className="text-xs text-gray-500 mt-1">
                      Stock: {producto.stock_gramos}g
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Prueba con otra búsqueda o categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSearchProductoPeso;