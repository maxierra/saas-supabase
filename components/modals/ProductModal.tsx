'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Html5Qrcode } from 'html5-qrcode';

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
  codigo_barras: string;
  fecha_vencimiento: string;
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
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    categoria: '',
    precio_compra: '',
    precio_venta: '',
    stock: '',
    codigo_barras: '',
    fecha_vencimiento: ''
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
          stock: product.stock?.toString() || '',
          codigo_barras: product.codigo_barras || '',
          fecha_vencimiento: product.fecha_vencimiento || ''
        });
      } else {
        setFormData({
          nombre: '',
          categoria: '',
          codigo_producto: '',
          precio_compra: '',
          precio_venta: '',
          stock: '',
          codigo_barras: '',
          fecha_vencimiento: ''
        });
        // Generar código de producto automáticamente para nuevos productos
        generateProductCode();
      }
      setErrors({});
    }
  }, [isOpen, isEditing, product, generateProductCode, fetchCategorias]);

  // Efecto para enfocar el campo de código de barras cuando se abre el modal
  useEffect(() => {
    if (isVisible && !isEditing) {
      // Pequeño retraso para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isEditing]);

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
    
    if (!formData.codigo_barras.trim()) {
      newErrors.codigo_barras = 'El código de barras es requerido';
    }
    
    if (!formData.fecha_vencimiento.trim()) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
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
            codigo_producto: formData.codigo_producto.trim(),
            nombre: formData.nombre,
            categoria: formData.categoria || null,
            precio_compra,
            precio_venta,
            stock,
            codigo_barras: formData.codigo_barras.trim(),
            fecha_vencimiento: formData.fecha_vencimiento
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
            codigo_producto: formData.codigo_producto.trim(),
            nombre: formData.nombre,
            categoria: formData.categoria || null,
            precio_compra,
            precio_venta,
            stock,
            codigo_barras: formData.codigo_barras.trim(),
            fecha_vencimiento: formData.fecha_vencimiento
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

  // Función para iniciar el escáner de códigos de barras
  const startBarcodeScanner = useCallback(() => {
    if (!scannerContainerRef.current) return;
    
    setIsScanning(true);
    
    const html5QrCode = new Html5Qrcode("barcode-reader");
    scannerRef.current = html5QrCode;
    
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 150 }
      },
      (decodedText: string) => {
        // Al detectar un código de barras, lo asignamos al campo
        setFormData(prev => ({
          ...prev,
          codigo_barras: decodedText
        }));
        // Detenemos el escáner
        stopBarcodeScanner();
      },
      (errorMessage: string) => {
        // Solo registramos errores importantes, no los de escaneo continuo
        if (errorMessage.includes('Unable to start scanning')) {
          console.error(errorMessage);
        }
      }
    ).catch((err: Error) => {
      console.error("Error al iniciar el escáner:", err);
      setIsScanning(false);
    });
  }, []);
  
  // Función para detener el escáner
  const stopBarcodeScanner = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err: Error) => {
          console.error("Error al detener el escáner:", err);
        });
    } else {
      setIsScanning(false);
    }
  }, []);

  // Manejar el escáner de código de barras
  const handleScannerToggle = (type: 'usb' | 'camera') => {
    if (type === 'usb') {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } else {
      if (isScanning) {
        stopBarcodeScanner();
      } else {
        startBarcodeScanner();
      }
    }
  };

  // Detener el escáner cuando se cierra el modal
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${!isVisible ? 'hidden' : ''}`}>
      <div className="fixed inset-0 bg-black opacity-50"></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de códigos */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de barras *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      name="codigo_barras"
                      value={formData.codigo_barras}
                      onChange={handleChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Escanee el código o ingrese manualmente"
                    />
                    <div className="ml-2 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleScannerToggle('usb')}
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Usar lector USB
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScannerToggle('camera')}
                        className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Usar cámara
                      </button>
                    </div>
                  </div>
                  {formData.codigo_barras && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <div className="inline-block">
                          <svg
                            className="h-12"
                            viewBox="0 0 100 30"
                            style={{
                              fill: 'black',
                              fillRule: 'nonzero',
                              stroke: 'none',
                              strokeWidth: 1
                            }}
                          >
                            {/* Simulación visual de código de barras */}
                            {Array.from({ length: 30 }).map((_, i) => (
                              <rect
                                key={i}
                                x={i * 3}
                                y="0"
                                width="2"
                                height="30"
                                style={{ opacity: Math.random() > 0.5 ? 1 : 0 }}
                              />
                            ))}
                          </svg>
                          <div className="text-xs text-gray-600 mt-1">{formData.codigo_barras}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isScanning && (
                    <div ref={scannerContainerRef} className="mt-2 bg-gray-50 rounded-lg overflow-hidden" style={{ height: '200px' }} />
                  )}
                </div>
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
                  placeholder="Ej: Laptop HP Pavilion"
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

          {/* Sección de precios y stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de compra *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="precio_compra"
                  value={formData.precio_compra}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de venta *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="precio_venta"
                  value={formData.precio_venta}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
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
}

export default ProductModal;
