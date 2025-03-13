'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ProductModal from '@/components/modals/ProductModal';
import ProductoPesoModal from '@/components/modals/ProductoPesoModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

// Definimos una interfaz para el tipo de producto
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

// Definimos una interfaz para el tipo de producto por peso
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

export default function ProductosPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Estado para los productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosPeso, setProductosPeso] = useState<ProductoPeso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el modal de nuevo/editar producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPesoModalOpen, setIsPesoModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Producto | null>(null);
  const [currentProductoPeso, setCurrentProductoPeso] = useState<ProductoPeso | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para el modal de confirmación de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Producto | ProductoPeso | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'normal' | 'peso'>('normal');

  // Función para cargar productos desde Supabase
  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      
      const [productosResult, productosPesoResult] = await Promise.all([
        supabase
          .from('productos')
          .select('*')
          .eq('uid', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('productos_peso')
          .select('*')
          .eq('uid', uid)
          .order('created_at', { ascending: false })
      ]);
      
      if (productosResult.error) throw productosResult.error;
      if (productosPesoResult.error) throw productosPesoResult.error;
      
      setProductos(productosResult.data || []);
      setProductosPeso(productosPesoResult.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductos();
  }, [loadProductos]);
  
  // Función para abrir el modal de edición
  const handleEdit = (product: Producto) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  // Función para abrir el modal de nuevo producto
  const handleNew = () => {
    setCurrentProduct(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };
  
  // Función para abrir el modal de nuevo producto por peso
  const handleNewPeso = () => {
    setCurrentProductoPeso(null);
    setIsEditing(false);
    setIsPesoModalOpen(true);
  };
  
  // Función para abrir el modal de confirmación de eliminación
  const handleDeleteConfirm = (product: Producto | ProductoPeso, type: 'normal' | 'peso') => {
    setProductToDelete(product);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };
  
  // Función para eliminar un producto
  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from(deleteType === 'normal' ? 'productos' : 'productos_peso')
        .delete()
        .eq('id', productToDelete.id);
      
      if (error) throw error;
      
      await loadProductos();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('No se pudo eliminar el producto. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <div className="space-x-2">
          <button
            onClick={handleNew}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Nuevo Producto
          </button>
          <button
            onClick={handleNewPeso}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            + Nuevo Producto por Peso
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Compra</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">Cargando productos...</td>
              </tr>
            ) : productos.length === 0 && productosPeso.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">No hay productos registrados</td>
              </tr>
            ) : (
              [...productos.map(product => ({
                ...product,
                type: 'normal' as const
              })), ...productosPeso.map(product => ({
                ...product,
                type: 'peso' as const
              }))].map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.codigo_producto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.categoria}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.type === 'normal' 
                      ? `$${product.precio_compra?.toFixed(2)}` 
                      : `$${(product as ProductoPeso).precio_compra_gramo?.toFixed(2)}/g`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.type === 'normal' 
                      ? `$${product.precio_venta?.toFixed(2)}` 
                      : `$${(product as ProductoPeso).precio_venta_gramo?.toFixed(2)}/g`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.type === 'normal' 
                      ? product.stock 
                      : `${(product as ProductoPeso).stock_gramos?.toFixed(2)}g`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.type === 'normal' ? 'Unidad' : 'Peso'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        if (product.type === 'normal') {
                          setCurrentProduct(product);
                          setIsModalOpen(true);
                        } else {
                          setCurrentProductoPeso(product as ProductoPeso);
                          setIsPesoModalOpen(true);
                        }
                        setIsEditing(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(product, product.type)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={loadProductos}
        uid={uid}
        product={currentProduct}
        isEditing={isEditing}
      />

      <ProductoPesoModal
        isOpen={isPesoModalOpen}
        onClose={() => setIsPesoModalOpen(false)}
        onProductAdded={loadProductos}
        uid={uid}
        product={currentProductoPeso}
        isEditing={isEditing}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemName={productToDelete?.nombre || ''}
      />
    </div>
  );
}
