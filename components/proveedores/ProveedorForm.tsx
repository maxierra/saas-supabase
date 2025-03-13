'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Proveedor {
  id?: string;
  uid: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
}

interface ProveedorFormProps {
  uid: string;
  proveedor?: Proveedor;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProveedorForm({ uid, proveedor, onSuccess, onCancel }: ProveedorFormProps) {
  const isEditing = !!proveedor?.id;
  
  const [formData, setFormData] = useState<Proveedor>({
    id: proveedor?.id || undefined,
    uid: uid,
    nombre: proveedor?.nombre || '',
    contacto: proveedor?.contacto || '',
    email: proveedor?.email || '',
    telefono: proveedor?.telefono || '',
    direccion: proveedor?.direccion || '',
    notas: proveedor?.notas || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        // Actualizar proveedor existente
        const { error: updateError } = await supabase
          .from('proveedores')
          .update({
            nombre: formData.nombre,
            contacto: formData.contacto,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion,
            notas: formData.notas,
          })
          .eq('id', formData.id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo proveedor
        const { error: insertError } = await supabase
          .from('proveedores')
          .insert({
            uid: uid,
            nombre: formData.nombre,
            contacto: formData.contacto,
            email: formData.email,
            telefono: formData.telefono,
            direccion: formData.direccion,
            notas: formData.notas,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar proveedor:', err);
      setError(err.message || 'Error al guardar el proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre del Proveedor *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">
          Persona de Contacto
        </label>
        <input
          type="text"
          id="contacto"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          value={formData.notas}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
