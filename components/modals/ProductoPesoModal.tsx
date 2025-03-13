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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Editar Producto por Peso' : 'Nuevo Producto por Peso'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código de Producto</label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  name="codigo_producto"
                  value={formData.codigo_producto}
                  onChange={handleChange}
                  className={`flex-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.codigo_producto ? 'border-red-500' : ''}`}
                  disabled={isGeneratingCode}
                />
              </div>
              {errors.codigo_producto && (
                <p className="mt-1 text-sm text-red-500">{errors.codigo_producto}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.nombre ? 'border-red-500' : ''}`}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.categoria ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar categoría</option>
                {loadingCategorias ? (
                  <option disabled>Cargando categorías...</option>
                ) : (
                  categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))
                )}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-500">{errors.categoria}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Compra por Kilo</label>
              <input
                type="number"
                step="0.01"
                name="precio_compra_kilo"
                value={formData.precio_compra_kilo}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.precio_compra_kilo ? 'border-red-500' : ''}`}
              />
              {errors.precio_compra_kilo && (
                <p className="mt-1 text-sm text-red-500">{errors.precio_compra_kilo}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Venta por Kilo</label>
              <input
                type="number"
                step="0.01"
                name="precio_venta_kilo"
                value={formData.precio_venta_kilo}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.precio_venta_kilo ? 'border-red-500' : ''}`}
              />
              {errors.precio_venta_kilo && (
                <p className="mt-1 text-sm text-red-500">{errors.precio_venta_kilo}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Compra por Gramo (Calculado)</label>
              <input
                type="number"
                step="0.01"
                name="precio_compra_gramo"
                value={formData.precio_compra_gramo}
                readOnly
                className="mt-1 block w-full rounded-md sm:text-sm border-gray-300 bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Venta por Gramo (Calculado)</label>
              <input
                type="number"
                step="0.01"
                name="precio_venta_gramo"
                value={formData.precio_venta_gramo}
                readOnly
                className="mt-1 block w-full rounded-md sm:text-sm border-gray-300 bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock en Gramos</label>
              <input
                type="number"
                step="0.01"
                name="stock_gramos"
                value={formData.stock_gramos}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md sm:text-sm border-gray-300 ${errors.stock_gramos ? 'border-red-500' : ''}`}
              />
              {errors.stock_gramos && (
                <p className="mt-1 text-sm text-red-500">{errors.stock_gramos}</p>
              )}
            </div>
          </div>
          
          {errors.submit && (
            <p className="mt-4 text-sm text-red-500">{errors.submit}</p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoPesoModal;