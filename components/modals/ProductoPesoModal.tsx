'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface Categoria {
  id: string;
  uid: string;
  nombre: string;
  descripcion: string | null;
  color: string | null;
}

interface ProductoPesoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  uid: string;
  product?: ProductoPeso | null;
  isEditing?: boolean;
}

const ProductoPesoModal = ({ 
  isOpen, 
  onClose, 
  onProductAdded, 
  uid, 
  product = null, 
  isEditing = false 
}: ProductoPesoModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    categoria: '',
    precio_compra_kilo: '',
    precio_venta_kilo: '',
    precio_compra_gramo: '',
    precio_venta_gramo: '',
    stock_gramos: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar categorías
  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('uid', uid)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoadingCategorias(false);
    }
  }, [uid]);

  const generateProductCode = useCallback(async () => {
    setIsGeneratingCode(true);
    try {
      const { data, error } = await supabase
        .from('productos_peso')
        .select('codigo_producto')
        .eq('uid', uid)
        .order('codigo_producto', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error al obtener último código:', error);
        return;
      }

      let nextCode = 'PW0001';

      if (data && data.length > 0 && data[0].codigo_producto) {
        const lastCode = data[0].codigo_producto;
        const match = lastCode.match(/PW(\d+)/);
        
        if (match && match[1]) {
          const lastNumber = parseInt(match[1], 10);
          const nextNumber = lastNumber + 1;
          nextCode = `PW${nextNumber.toString().padStart(4, '0')}`;
        }
      }

      setFormData(prev => ({ ...prev, codigo_producto: nextCode }));
    } catch (err) {
      console.error('Error al generar código:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [uid]);

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      // Cargar categorías
      fetchCategorias();
      
      if (isEditing && product) {
        setFormData({
          nombre: product.nombre || '',
          categoria: product.categoria || '',
          codigo_producto: product.codigo_producto || '',
          precio_compra_gramo: product.precio_compra_gramo?.toString() || '',
          precio_venta_gramo: product.precio_venta_gramo?.toString() || '',
          precio_compra_kilo: (product.precio_compra_gramo ? (product.precio_compra_gramo * 1000).toString() : ''),
          precio_venta_kilo: (product.precio_venta_gramo ? (product.precio_venta_gramo * 1000).toString() : ''),
          stock_gramos: product.stock_gramos?.toString() || ''
        });
      } else {
        setFormData({
          nombre: '',
          categoria: '',
          codigo_producto: '',
          precio_compra_gramo: '',
          precio_venta_gramo: '',
          precio_compra_kilo: '',
          precio_venta_kilo: '',
          stock_gramos: ''
        });
        generateProductCode();
      }
      setErrors({});
    }
  }, [isOpen, isEditing, product, generateProductCode, fetchCategorias]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Convertir precio por kilo a precio por gramo automáticamente
      if (name === 'precio_compra_kilo') {
        const precioKilo = parseFloat(value);
        newData.precio_compra_gramo = isNaN(precioKilo) ? '' : (precioKilo / 1000).toFixed(2);
      }
      if (name === 'precio_venta_kilo') {
        const precioKilo = parseFloat(value);
        newData.precio_venta_gramo = isNaN(precioKilo) ? '' : (precioKilo / 1000).toFixed(2);
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida';
    }
    
    if (!formData.codigo_producto.trim()) {
      newErrors.codigo_producto = 'El código de producto es requerido';
    }
    
    const precioCompraGramo = parseFloat(formData.precio_compra_gramo);
    if (isNaN(precioCompraGramo) || precioCompraGramo < 0) {
      newErrors.precio_compra_gramo = 'Ingrese un precio de compra por gramo válido';
    }
    
    const precioVentaGramo = parseFloat(formData.precio_venta_gramo);
    if (isNaN(precioVentaGramo) || precioVentaGramo < 0) {
      newErrors.precio_venta_gramo = 'Ingrese un precio de venta por gramo válido';
    }
    
    const stockGramos = parseFloat(formData.stock_gramos);
    if (isNaN(stockGramos) || stockGramos < 0) {
      newErrors.stock_gramos = 'Ingrese un stock en gramos válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const precio_compra_gramo = parseFloat(formData.precio_compra_gramo);
      const precio_venta_gramo = parseFloat(formData.precio_venta_gramo);
      const stock_gramos = parseFloat(formData.stock_gramos);
      
      if (!isEditing || (isEditing && product && product.codigo_producto !== formData.codigo_producto)) {
        const { data, error: checkError } = await supabase
          .from('productos_peso')
          .select('id')
          .eq('uid', uid)
          .eq('codigo_producto', formData.codigo_producto)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (data) {
          setErrors({
            codigo_producto: 'Este código de producto ya existe'
          });
          return;
        }
      }
      
      if (isEditing && product) {
        const { error } = await supabase
          .from('productos_peso')
          .update({
            nombre: formData.nombre,
            categoria: formData.categoria,
            codigo_producto: formData.codigo_producto,
            precio_compra_gramo,
            precio_venta_gramo,
            stock_gramos
          })
          .eq('id', product.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos_peso')
          .insert({
            uid,
            nombre: formData.nombre,
            categoria: formData.categoria,
            codigo_producto: formData.codigo_producto,
            precio_compra_gramo,
            precio_venta_gramo,
            stock_gramos
          });
        
        if (error) throw error;
      }
      
      onProductAdded();
      onClose();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setErrors({
        submit: 'Error al guardar el producto. Por favor, intenta de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${!isVisible ? 'hidden' : ''}`}>
      <div className="fixed inset-0 bg-black opacity-50"></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {isEditing ? 'Editar Producto por Peso' : 'Nuevo Producto por Peso'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección superior: Código y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de producto *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="codigo_producto"
                    value={formData.codigo_producto}
                    onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    readOnly={!isEditing}
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={generateProductCode}
                      disabled={isGeneratingCode}
                      className="ml-2 px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      Regenerar código
                    </button>
                  )}
                </div>
                {!isEditing && (
                  <p className="mt-1 text-sm text-gray-500">
                    Este código se genera automáticamente y será utilizado para identificar el producto.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Manzanas Red Delicious"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección de precios por kilo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Compra por Kilo *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="precio_compra_kilo"
                  value={formData.precio_compra_kilo}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Precio por gramo: ${formData.precio_compra_gramo || '0.00'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta por Kilo *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="precio_venta_kilo"
                  value={formData.precio_venta_kilo}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Precio por gramo: ${formData.precio_venta_gramo || '0.00'}
              </p>
            </div>
          </div>

          {/* Stock en gramos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock en Gramos *
            </label>
            <input
              type="number"
              name="stock_gramos"
              value={formData.stock_gramos}
              onChange={handleChange}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: 5000 para 5 kilos"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.stock_gramos ? `${(parseFloat(formData.stock_gramos) / 1000).toFixed(2)} kilos` : '0 kilos'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoPesoModal;