'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Creamos el cliente de Supabase en el lado del cliente
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Esta lógica solo debe ejecutarse en el cliente
    if (typeof window === 'undefined') return;
    
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (token && type === 'recovery') {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error al restaurar sesión:', error);
          setError('No se pudo restaurar la sesión. Intenta solicitar el cambio de contraseña nuevamente.');
        }
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Contraseña actualizada exitosamente');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Nueva contraseña"
        required
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar nueva contraseña"
        required
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
      />
      <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300">
        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-center">Éxito</h2>
            <p className="text-center">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 w-full"
            >
              Ir a Login
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default ResetPasswordForm;