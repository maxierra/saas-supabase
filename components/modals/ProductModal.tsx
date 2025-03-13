'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Producto {
  id: string;
  uid: string;
  nombre: string;
  precio_compra: number;
  precio_venta: number;
  profit: number;
  stock: number;
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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  uid: string;
  product?: Producto | null; // Producto a editar (opcional)
  isEditing?: boolean;
}

const ProductModal = ({ 
  isOpen, 
  onClose, 
  onProductAdded, 
  uid, 
  product = null, 
  isEditing = false 
}: ProductModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    categoria: '',
    precio_compra: '',
    precio_venta: '',
    stock: ''
  });

  // Errores de validación
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

  // Generar código de producto automáticamente
  const generateProductCode = useCallback(async () => {
    setIsGeneratingCode(true);
    try {
      // Obtener el último código de producto para este usuario
      const { data, error } = await supabase
        .from('productos')
        .select('codigo_producto')
        .eq('uid', uid)
        .order('codigo_producto', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error al obtener último código:', error);
        return;
      }

      let nextCode = 'P0001'; // Código por defecto si no hay productos

      if (data && data.length > 0 && data[0].codigo_producto) {
        // Extraer el número del último código y aumentarlo en 1
        const lastCode = data[0].codigo_producto;
        const match = lastCode.match(/P(\d+)/);
        
        if (match && match[1]) {
          const lastNumber = parseInt(match[1], 10);
          const nextNumber = lastNumber + 1;
          nextCode = `P${nextNumber.toString().padStart(4, '0')}`;
        }
      }

      setFormData(prev => ({ ...prev, codigo_producto: nextCode }));
    } catch (err) {
      console.error('Error al generar código:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [uid]);

  // Efecto para manejar la visibilidad del modal
  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      // Cargar categorías
      fetchCategorias();
      
      // Si estamos editando, cargar los datos del producto
      if (isEditing && product) {
        setFormData({
          nombre: product.nombre || '',
          categoria: product.categoria || '',
          codigo_producto: product.codigo_producto || '',
          precio_compra: product.precio_compra?.toString() || '',
          precio_venta: product.precio_venta?.toString() || '',
          stock: product.stock?.toString() || ''
        });
      } else {
        setFormData({
          nombre: '',
          categoria: '',
          codigo_producto: '',
          precio_compra: '',
          precio_venta: '',
          stock: ''
        });
        // Generar código de producto automáticamente para nuevos productos
        generateProductCode();
      }
      setErrors({});
    }
  }, [isOpen, isEditing, product, generateProductCode, fetchCategorias]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar el error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar el formulario
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
    
    const precioCompra = parseFloat(formData.precio_compra);
    if (isNaN(precioCompra) || precioCompra < 0) {
      newErrors.precio_compra = 'Ingrese un precio de compra válido';
    }
    
    const precioVenta = parseFloat(formData.precio_venta);
    if (isNaN(precioVenta) || precioVenta < 0) {
      newErrors.precio_venta = 'Ingrese un precio de venta válido';
    }
    
    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Ingrese un stock válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convertir valores a números
      const precio_compra = parseFloat(formData.precio_compra);
      const precio_venta = parseFloat(formData.precio_venta);
      const stock = parseInt(formData.stock);
      
      // Verificar si el código de producto ya existe (para evitar duplicados)
      if (!isEditing || (isEditing && product && product.codigo_producto !== formData.codigo_producto)) {
        const { data, error: checkError } = await supabase
          .from('productos')
          .select('id')
          .eq('uid', uid)
          .eq('codigo_producto', formData.codigo_producto)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (data) {
          setErrors(prev => ({
            ...prev,
            codigo_producto: 'Este código de producto ya está en uso'
          }));
          setIsSubmitting(false);
          return;
        }
      }
      
      let error;
      
      if (isEditing && product) {
        // Actualizar producto existente
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            codigo_producto: formData.codigo_producto,
            nombre: formData.nombre,
            categoria: formData.categoria || null,
            precio_compra,
            precio_venta,
            stock
          })
          .eq('id', product.id)
          .eq('uid', uid);
          
        error = updateError;
      } else {
        // Insertar nuevo producto
        const { error: insertError } = await supabase
          .from('productos')
          .insert({
            uid,
            codigo_producto: formData.codigo_producto,
            nombre: formData.nombre,
            categoria: formData.categoria || null,
            precio_compra,
            precio_venta,
            stock
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
      // Notificar que se agregó/actualizó un producto
      onProductAdded();
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar el producto. Inténtalo de nuevo.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Overlay semi-transparente */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>

        {/* Modal */}
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  {/* Código de producto */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="codigo_producto" className="block text-sm font-medium text-gray-700">
                        Código de producto *
                      </label>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={generateProductCode}
                          disabled={isGeneratingCode}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          {isGeneratingCode ? 'Generando...' : 'Regenerar código'}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      name="codigo_producto"
                      id="codigo_producto"
                      value={formData.codigo_producto}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.codigo_producto ? 'border-red-500' : ''}`}
                      placeholder="Ej: P0001"
                      readOnly={!isEditing}
                    />
                    {errors.codigo_producto && <p className="mt-1 text-sm text-red-600">{errors.codigo_producto}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {isEditing 
                        ? "Puedes editar el código si es necesario."
                        : "Este código se genera automáticamente y será utilizado para identificar el producto."}
                    </p>
                  </div>
                  
                  {/* Nombre del producto */}
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del producto *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.nombre ? 'border-red-500' : ''}`}
                      placeholder="Ej: Laptop HP Pavilion"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                  </div>
                  
                  {/* Categoría */}
                  <div className="mb-4">
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      name="categoria"
                      id="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.categoria ? 'border-red-500' : ''}`}
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
                    {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>}
                  </div>
                  
                  {/* Precios */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="precio_compra" className="block text-sm font-medium text-gray-700 mb-1">
                        Precio de compra *
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          name="precio_compra"
                          id="precio_compra"
                          value={formData.precio_compra}
                          onChange={handleChange}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md ${errors.precio_compra ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.precio_compra && <p className="mt-1 text-sm text-red-600">{errors.precio_compra}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="precio_venta" className="block text-sm font-medium text-gray-700 mb-1">
                        Precio de venta *
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          name="precio_venta"
                          id="precio_venta"
                          value={formData.precio_venta}
                          onChange={handleChange}
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md ${errors.precio_venta ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.precio_venta && <p className="mt-1 text-sm text-red-600">{errors.precio_venta}</p>}
                    </div>
                  </div>
                  
                  {/* Stock */}
                  <div className="mb-4">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="text"
                      name="stock"
                      id="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.stock ? 'border-red-500' : ''}`}
                      placeholder="Ej: 10"
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>
                  
                  {/* Error general */}
                  {errors.submit && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{errors.submit}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Botones */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
