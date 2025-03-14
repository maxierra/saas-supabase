'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Definimos la interfaz para las categorías
interface Categoria {
  id: string;
  uid: string;
  nombre: string;
  descripcion: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// Definimos la interfaz para los datos del comercio
interface DatosComercio {
  id: string;
  uid: string;
  nombre_comercio: string;
  direccion: string | null;
  telefono: string | null;
  cuit: string | null;
  descripcion: string | null;
  numero_facturacion: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Definimos la interfaz para los medios de pago
interface MedioPago {
  id: string;
  uid: string;
  tipo: string;
  detalles: string | null;
  created_at: string;
  updated_at: string;
}

export default function ConfiguracionesPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Estados para las categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el formulario de categorías
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Color azul por defecto
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para la edición de categorías
  const [editMode, setEditMode] = useState(false);
  const [currentCategoriaId, setCurrentCategoriaId] = useState<string | null>(null);
  
  // Estados para los datos del comercio
  const [datosComercio, setDatosComercio] = useState<DatosComercio | null>(null);
  const [loadingComercio, setLoadingComercio] = useState(true);
  const [errorComercio, setErrorComercio] = useState<string | null>(null);
  const [isSubmittingComercio, setIsSubmittingComercio] = useState(false);
  
  // Estados para el formulario de datos del comercio
  const [nombreComercio, setNombreComercio] = useState('');
  const [direccionComercio, setDireccionComercio] = useState('');
  const [telefonoComercio, setTelefonoComercio] = useState('');
  const [cuitComercio, setCuitComercio] = useState('');
  const [descripcionComercio, setDescripcionComercio] = useState('');
  const [numeroFacturacion, setNumeroFacturacion] = useState(1);
  
  // Estados para el formulario de medios de pago
  const [tipoMedioPago, setTipoMedioPago] = useState('');
  const [detallesMedioPago, setDetallesMedioPago] = useState('');
  const [isSubmittingPago, setIsSubmittingPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [editModePago, setEditModePago] = useState(false);
  const [currentMedioPagoId, setCurrentMedioPagoId] = useState<string | null>(null);
  
  // Estados para los medios de pago
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [loadingPago, setLoadingPago] = useState(true);
  
  // Cargar categorías desde Supabase
  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('uid', uid)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      
      setCategorias(data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [uid]);
  
  // Cargar datos del comercio desde Supabase
  const loadDatosComercio = useCallback(async () => {
    try {
      setLoadingComercio(true);
      
      const { data, error } = await supabase
        .from('datos_comercio')
        .select('*')
        .eq('uid', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron resultados"
        throw error;
      }
      
      if (data) {
        setDatosComercio(data);
        setNombreComercio(data.nombre_comercio);
        setDireccionComercio(data.direccion || '');
        setTelefonoComercio(data.telefono || '');
        setCuitComercio(data.cuit || '');
        setDescripcionComercio(data.descripcion || '');
        setNumeroFacturacion(data.numero_facturacion || 1);
      }
      
      setErrorComercio(null);
    } catch (err) {
      console.error('Error al cargar datos del comercio:', err);
      setErrorComercio('No se pudieron cargar los datos del comercio. Por favor, intenta de nuevo.');
    } finally {
      setLoadingComercio(false);
    }
  }, [uid]);
  
  // Cargar medios de pago desde Supabase
  const loadMediosPago = useCallback(async () => {
    try {
      setLoadingPago(true);
      
      const { data, error } = await supabase
        .from('medios_pago')
        .select('*')
        .eq('uid', uid);
      
      if (error) throw error;
      
      setMediosPago(data || []);
    } catch (err) {
      console.error('Error al cargar medios de pago:', err);
    } finally {
      setLoadingPago(false);
    }
  }, [uid]);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    loadCategorias();
    loadDatosComercio();
    loadMediosPago();
  }, [loadCategorias, loadDatosComercio, loadMediosPago]);
  
  // Función para guardar una nueva categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (editMode && currentCategoriaId) {
        // Actualizar categoría existente
        const { error } = await supabase
          .from('categorias')
          .update({
            nombre,
            descripcion: descripcion || null,
            color,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCategoriaId)
          .eq('uid', uid);
        
        if (error) throw error;
      } else {
        // Insertar nueva categoría
        const { error } = await supabase
          .from('categorias')
          .insert({
            uid,
            nombre,
            descripcion: descripcion || null,
            color
          });
        
        if (error) throw error;
      }
      
      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setColor('#3B82F6');
      setEditMode(false);
      setCurrentCategoriaId(null);
      
      // Recargar categorías
      await loadCategorias();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError('No se pudo guardar la categoría. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para guardar los datos del comercio
  const handleSubmitComercio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombreComercio.trim()) {
      setErrorComercio('El nombre del comercio es obligatorio');
      return;
    }
    
    setIsSubmittingComercio(true);
    setErrorComercio(null);
    
    try {
      if (datosComercio) {
        // Actualizar datos existentes
        const { error } = await supabase
          .from('datos_comercio')
          .update({
            nombre_comercio: nombreComercio,
            direccion: direccionComercio || null,
            telefono: telefonoComercio || null,
            cuit: cuitComercio || null,
            descripcion: descripcionComercio || null,
            numero_facturacion: numeroFacturacion,
            updated_at: new Date().toISOString()
          })
          .eq('id', datosComercio.id)
          .eq('uid', uid);
        
        if (error) throw error;
      } else {
        // Insertar nuevos datos
        const { error } = await supabase
          .from('datos_comercio')
          .insert({
            uid,
            nombre_comercio: nombreComercio,
            direccion: direccionComercio || null,
            telefono: telefonoComercio || null,
            cuit: cuitComercio || null,
            descripcion: descripcionComercio || null,
            numero_facturacion: numeroFacturacion
          });
        
        if (error) throw error;
      }
      
      // Recargar datos del comercio
      await loadDatosComercio();
    } catch (err) {
      console.error('Error al guardar datos del comercio:', err);
      setErrorComercio('No se pudieron guardar los datos del comercio. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmittingComercio(false);
    }
  };
  
  // Función para agregar o actualizar un medio de pago
  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoMedioPago.trim()) {
      setErrorPago('El tipo de medio de pago es obligatorio');
      return;
    }
    
    setIsSubmittingPago(true);
    setErrorPago(null);
    
    try {
      if (editModePago && currentMedioPagoId) {
        // Actualizar medio de pago existente
        const { error } = await supabase
          .from('medios_pago')
          .update({
            tipo: tipoMedioPago,
            detalles: detallesMedioPago || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentMedioPagoId)
          .eq('uid', uid);
        
        if (error) throw error;
      } else {
        // Insertar nuevo medio de pago
        const { error } = await supabase
          .from('medios_pago')
          .insert({
            uid,
            tipo: tipoMedioPago,
            detalles: detallesMedioPago || null,
          });
        
        if (error) throw error;
      }
      
      // Limpiar formulario
      setTipoMedioPago('');
      setDetallesMedioPago('');
      setEditModePago(false);
      setCurrentMedioPagoId(null);
      
      // Recargar medios de pago
      await loadMediosPago();
    } catch (err) {
      console.error('Error al guardar medio de pago:', err);
      setErrorPago('No se pudo guardar el medio de pago. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmittingPago(false);
    }
  };

  // Función para editar un medio de pago
  const handleEditPago = (medioPago: MedioPago) => {
    setTipoMedioPago(medioPago.tipo);
    setDetallesMedioPago(medioPago.detalles || '');
    setEditModePago(true);
    setCurrentMedioPagoId(medioPago.id);
  };

  // Función para eliminar un medio de pago
  const handleDeletePago = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este medio de pago? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoadingPago(true);
      
      const { error } = await supabase
        .from('medios_pago')
        .delete()
        .eq('id', id)
        .eq('uid', uid);
      
      if (error) throw error;
      
      // Recargar medios de pago
      await loadMediosPago();
    } catch (err) {
      console.error('Error al eliminar medio de pago:', err);
      setErrorPago('No se pudo eliminar el medio de pago. Por favor, intenta de nuevo.');
    } finally {
      setLoadingPago(false);
    }
  };

  // Función para cancelar la edición de medio de pago
  const handleCancelPago = () => {
    setTipoMedioPago('');
    setDetallesMedioPago('');
    setEditModePago(false);
    setCurrentMedioPagoId(null);
    setErrorPago(null);
  };
  
  // Función para editar una categoría
  const handleEdit = (categoria: Categoria) => {
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion || '');
    setColor(categoria.color || '#3B82F6');
    setEditMode(true);
    setCurrentCategoriaId(categoria.id);
  };
  
  // Función para eliminar una categoría
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('uid', uid);
      
      if (error) throw error;
      
      // Recargar categorías
      await loadCategorias();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      setError('No se pudo eliminar la categoría. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cancelar la edición
  const handleCancel = () => {
    setNombre('');
    setDescripcion('');
    setColor('#3B82F6');
    setEditMode(false);
    setCurrentCategoriaId(null);
    setError(null);
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuraciones</h1>
        <p className="text-sm text-gray-600 mt-1 sm:mt-0">
          ID de usuario: {uid.substring(0, 8)}...
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Formulario de categorías */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {editMode ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Electrónicos"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Descripción opcional de la categoría"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 border border-gray-300 rounded-md shadow-sm cursor-pointer mr-2"
                    />
                    <span className="text-sm text-gray-500">{color}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : editMode ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Lista de categorías */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando categorías...</p>
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No hay categorías registradas. Crea tu primera categoría.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <li key={categoria.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="h-6 w-6 rounded-full mr-3" 
                          style={{ backgroundColor: categoria.color || '#3B82F6' }}
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{categoria.nombre}</h3>
                          {categoria.descripcion && (
                            <p className="text-xs text-gray-500 mt-1">{categoria.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id)}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Sección de Datos del Comercio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario de datos del comercio */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Datos del Comercio
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {errorComercio && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {errorComercio}
              </div>
            )}
            
            <form onSubmit={handleSubmitComercio}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombreComercio" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Comercio *
                  </label>
                  <input
                    type="text"
                    id="nombreComercio"
                    value={nombreComercio}
                    onChange={(e) => setNombreComercio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Mi Tienda"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="direccionComercio" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccionComercio"
                    value={direccionComercio}
                    onChange={(e) => setDireccionComercio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>
                
                <div>
                  <label htmlFor="telefonoComercio" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="telefonoComercio"
                    value={telefonoComercio}
                    onChange={(e) => setTelefonoComercio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: +54 11 1234-5678"
                  />
                </div>
                
                <div>
                  <label htmlFor="cuitComercio" className="block text-sm font-medium text-gray-700 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    id="cuitComercio"
                    value={cuitComercio}
                    onChange={(e) => setCuitComercio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: 20-12345678-9"
                  />
                </div>
                
                <div>
                  <label htmlFor="descripcionComercio" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcionComercio"
                    value={descripcionComercio}
                    onChange={(e) => setDescripcionComercio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Descripción o información adicional del comercio"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="numeroFacturacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Facturación Inicial
                  </label>
                  <input
                    type="number"
                    id="numeroFacturacion"
                    value={numeroFacturacion}
                    onChange={(e) => setNumeroFacturacion(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: 1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Este número se usará como punto de partida para generar tickets y facturas.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmittingComercio}
                  >
                    {isSubmittingComercio ? 'Guardando...' : datosComercio ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Información del comercio */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Información del Comercio</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {loadingComercio ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando datos del comercio...</p>
              </div>
            ) : !datosComercio ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No hay datos del comercio registrados. Complete el formulario para agregar la información de su negocio.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{datosComercio.nombre_comercio}</h3>
                  
                  {datosComercio.direccion && (
                    <div className="flex items-start mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">{datosComercio.direccion}</span>
                    </div>
                  )}
                  
                  {datosComercio.telefono && (
                    <div className="flex items-start mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600">{datosComercio.telefono}</span>
                    </div>
                  )}
                  
                  {datosComercio.cuit && (
                    <div className="flex items-start mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">CUIT: {datosComercio.cuit}</span>
                    </div>
                  )}
                  
                  {datosComercio.descripcion && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción:</h4>
                      <p className="text-sm text-gray-600">{datosComercio.descripcion}</p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Número de facturación actual:</h4>
                    <p className="text-sm text-gray-600">{datosComercio.numero_facturacion}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última actualización: {new Date(datosComercio.updated_at).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sección de Medios de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario de medios de pago */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {editModePago ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'}
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {errorPago && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {errorPago}
              </div>
            )}
            
            <form onSubmit={handleSubmitPago}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tipoMedioPago" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Medio de Pago *
                  </label>
                  <input
                    type="text"
                    id="tipoMedioPago"
                    value={tipoMedioPago}
                    onChange={(e) => setTipoMedioPago(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Tarjeta de Crédito"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="detallesMedioPago" className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles
                  </label>
                  <input
                    type="text"
                    id="detallesMedioPago"
                    value={detallesMedioPago}
                    onChange={(e) => setDetallesMedioPago(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Número de tarjeta"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  {editModePago && (
                    <button
                      type="button"
                      onClick={handleCancelPago}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSubmittingPago}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmittingPago}
                  >
                    {isSubmittingPago ? 'Guardando...' : editModePago ? 'Actualizar' : 'Agregar Medio de Pago'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Lista de medios de pago */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Medios de Pago</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {loadingPago ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando medios de pago...</p>
              </div>
            ) : mediosPago.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No hay medios de pago registrados. Agrega tu primer medio de pago.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {mediosPago.map((medioPago) => (
                  <li key={medioPago.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{medioPago.tipo}</h3>
                          {medioPago.detalles && (
                            <p className="text-xs text-gray-500 mt-1">{medioPago.detalles}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPago(medioPago)}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePago(medioPago.id)}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
