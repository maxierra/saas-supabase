"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Modal from 'react-modal';

// Cliente con rol de servicio para operaciones privilegiadas
const supabaseAdmin = createClient(
  'https://crtgzjzzqrxyizraqpyk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTM0NjAwMiwiZXhwIjoyMDU2OTIyMDAyfQ.22ZOF3U4NQ6cdbDTNFi367OG7oi7ocumixatwLICF10'
);

export default function ChangePasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setModalIsOpen(false);
    setLoading(true);

    if (!email || !newPassword) {
      setError('Por favor, complete todos los campos');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Buscar el usuario por email usando la API de auth
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email
        }
      });

      if (userError || !users || users.length === 0) {
        throw new Error('Usuario no encontrado. Verifique que el correo electrónico sea correcto.');
      }

      // Actualizar la contraseña usando el cliente admin
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        users[0].id,
        { password: newPassword }
      );

      if (updateError) throw updateError;

      setSuccessMessage('Contraseña actualizada con éxito.');
      setModalIsOpen(true);
      setEmail('');
      setNewPassword('');
    } catch (error) {
      setError((error as Error).message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h1 className="text-3xl font-bold text-center mb-4">Tienda 360</h1>
      <h1 className="text-2xl font-bold text-center mb-4">Cambio de Contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Correo electrónico:</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
        </label>
        <label className="block">
          <span className="text-gray-700">Nueva contraseña:</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
        </label>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition duration-200">
          {loading ? 'Cargando...' : 'Actualizar contraseña'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </form>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2 style={{ textAlign: 'center', color: 'green' }}>Éxito</h2>
        <p style={{ textAlign: 'center', color: 'green' }}>{successMessage}</p>
        <button onClick={() => setModalIsOpen(false)} style={{ display: 'block', margin: '0 auto' }}>Cerrar</button>
      </Modal>
    </div>
  );
}
