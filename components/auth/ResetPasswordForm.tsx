'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface ResetPasswordFormProps {
  message?: string | null;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ message: initialMessage = null }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar las contraseñas
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Actualizar la contraseña directamente
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Contraseña actualizada exitosamente');
    }
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