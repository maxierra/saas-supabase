'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProveedoresList from '@/components/proveedores/ProveedoresList';
import ProveedorForm from '@/components/proveedores/ProveedorForm';
import PedidosList from '@/components/proveedores/PedidosList';
import PedidoForm from '@/components/proveedores/PedidoForm';
import PedidoDetails from '@/components/proveedores/PedidoDetails';

interface Proveedor {
  id: string;
  uid: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
  created_at: string;
  updated_at: string;
}

export default function ProveedoresPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Estados para gestionar proveedores
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [showProveedorDetails, setShowProveedorDetails] = useState(false);
  const [refreshProveedores, setRefreshProveedores] = useState(0);
  
  // Estados para gestionar pedidos
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [showPedidoDetails, setShowPedidoDetails] = useState(false);
  const [refreshPedidos, setRefreshPedidos] = useState(0);
  
  // Función para manejar la creación/edición de un proveedor
  const handleEditProveedor = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setShowProveedorForm(true);
    setShowProveedorDetails(false);
  };
  
  // Función para manejar la selección de un proveedor (ver detalles)
  const handleSelectProveedor = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setShowProveedorDetails(true);
    setShowPedidoForm(false);
    setShowPedidoDetails(false);
  };
  
  // Función para manejar la eliminación de un proveedor
  const handleDeleteProveedor = (id: string) => {
    // Si el proveedor eliminado es el que estamos viendo, cerrar los detalles
    if (selectedProveedor?.id === id) {
      setShowProveedorDetails(false);
      setSelectedProveedor(null);
    }
  };
  
  // Función para manejar la eliminación de un pedido
  const handleDeletePedido = (id: string) => {
    // Si el pedido eliminado es el que estamos viendo, cerrar los detalles
    if (selectedPedidoId === id) {
      setShowPedidoDetails(false);
      setSelectedPedidoId(null);
    }
  };
  
  // Función para manejar la creación de un nuevo pedido
  const handleNewPedido = () => {
    setSelectedPedidoId(null);
    setShowPedidoForm(true);
    setShowPedidoDetails(false);
  };
  
  // Función para manejar la edición de un pedido
  const handleEditPedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    setShowPedidoForm(true);
    setShowPedidoDetails(false);
  };
  
  // Función para manejar la visualización de detalles de un pedido
  const handleViewPedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    setShowPedidoDetails(true);
    setShowPedidoForm(false);
  };
  
  // Función para manejar el cierre de formularios y detalles
  const handleCloseAll = () => {
    setShowProveedorForm(false);
    setShowProveedorDetails(false);
    setShowPedidoForm(false);
    setShowPedidoDetails(false);
  };

  // Función para forzar la actualización de la lista de proveedores
  const handleProveedorSuccess = useCallback(() => {
    setShowProveedorForm(false);
    setRefreshProveedores(prev => prev + 1);
    
    // Si estamos editando, actualizar la vista de detalles
    if (selectedProveedor) {
      setShowProveedorDetails(true);
    }
  }, [selectedProveedor]);

  // Función para forzar la actualización de la lista de pedidos
  const handlePedidoSuccess = useCallback(() => {
    setShowPedidoForm(false);
    setRefreshPedidos(prev => prev + 1);
    
    // Si estamos editando, actualizar la vista de detalles
    if (selectedPedidoId) {
      setShowPedidoDetails(true);
    }
  }, [selectedPedidoId]);
  
  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Proveedores</h1>
        <p className="text-sm text-gray-600 mt-1 sm:mt-0">
          ID de usuario: {uid.substring(0, 8)}...
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Lista de proveedores */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Mis Proveedores</h2>
              <button
                onClick={() => {
                  setSelectedProveedor(null);
                  setShowProveedorForm(true);
                  setShowProveedorDetails(false);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nuevo Proveedor
              </button>
            </div>
            
            <ProveedoresList
              uid={uid}
              onEdit={handleEditProveedor}
              onDelete={handleDeleteProveedor}
              onSelect={handleSelectProveedor}
              refreshTrigger={refreshProveedores}
            />
          </div>
        </div>
        
        {/* Panel central y derecho: Detalles y formularios */}
        <div className="lg:col-span-2">
          {/* Formulario de proveedor */}
          {showProveedorForm && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <ProveedorForm
                uid={uid}
                proveedor={selectedProveedor || undefined}
                onSuccess={handleProveedorSuccess}
                onCancel={() => {
                  setShowProveedorForm(false);
                  // Si estamos editando, volver a mostrar los detalles
                  if (selectedProveedor) {
                    setShowProveedorDetails(true);
                  }
                }}
              />
            </div>
          )}
          
          {/* Detalles del proveedor y sus pedidos */}
          {showProveedorDetails && selectedProveedor && (
            <>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{selectedProveedor.nombre}</h2>
                    <p className="text-sm text-gray-500 mt-1">Información del proveedor</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditProveedor(selectedProveedor)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setShowProveedorDetails(false)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {selectedProveedor.contacto && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Persona de Contacto</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedProveedor.contacto}</dd>
                      </div>
                    )}
                    
                    {selectedProveedor.email && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedProveedor.email}</dd>
                      </div>
                    )}
                    
                    {selectedProveedor.telefono && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedProveedor.telefono}</dd>
                      </div>
                    )}
                    
                    {selectedProveedor.direccion && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedProveedor.direccion}</dd>
                      </div>
                    )}
                    
                    {selectedProveedor.notas && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notas</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedProveedor.notas}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {/* Pedidos del proveedor */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Pedidos a este Proveedor</h2>
                  <button
                    onClick={handleNewPedido}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Nuevo Pedido
                  </button>
                </div>
                
                <PedidosList
                  uid={uid}
                  proveedorId={selectedProveedor.id}
                  onEdit={handleEditPedido}
                  onDelete={(id) => {
                    handleDeletePedido(id);
                    setRefreshPedidos(prev => prev + 1);
                  }}
                  onView={handleViewPedido}
                  refreshTrigger={refreshPedidos}
                />
              </div>
            </>
          )}
          
          {/* Formulario de pedido */}
          {showPedidoForm && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPedidoId ? 'Editar Pedido' : 'Nuevo Pedido'}
              </h2>
              <PedidoForm
                uid={uid}
                proveedorId={selectedProveedor?.id}
                pedidoId={selectedPedidoId || undefined}
                onSuccess={handlePedidoSuccess}
                onCancel={() => {
                  setShowPedidoForm(false);
                  // Si estamos editando, volver a mostrar los detalles
                  if (selectedPedidoId) {
                    setShowPedidoDetails(true);
                  }
                }}
              />
            </div>
          )}
          
          {/* Detalles del pedido */}
          {showPedidoDetails && selectedPedidoId && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <PedidoDetails
                uid={uid}
                pedidoId={selectedPedidoId}
                onClose={() => setShowPedidoDetails(false)}
                onEdit={() => {
                  setShowPedidoForm(true);
                  setShowPedidoDetails(false);
                }}
              />
            </div>
          )}
          
          {/* Mensaje cuando no hay nada seleccionado */}
          {!showProveedorForm && !showProveedorDetails && !showPedidoForm && !showPedidoDetails && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Gestión de Proveedores</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona un proveedor de la lista para ver sus detalles y pedidos, o crea uno nuevo.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProveedor(null);
                      setShowProveedorForm(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Nuevo Proveedor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sección de todos los pedidos (visible cuando no hay proveedor seleccionado) */}
      {!showProveedorDetails && !showPedidoForm && !showPedidoDetails && (
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Todos los Pedidos</h2>
            <button
              onClick={handleNewPedido}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nuevo Pedido
            </button>
          </div>
          
          <PedidosList
            uid={uid}
            onEdit={handleEditPedido}
            onDelete={(id) => {
              handleDeletePedido(id);
              setRefreshPedidos(prev => prev + 1);
            }}
            onView={handleViewPedido}
            refreshTrigger={refreshPedidos}
          />
        </div>
      )}
    </div>
  );
}
