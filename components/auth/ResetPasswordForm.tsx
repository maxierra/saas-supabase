'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';

interface ResetPasswordFormProps {
  message?: string | null;
}

const ResetPasswordForm = dynamic<ResetPasswordFormProps>(() => Promise.resolve(({ message: initialMessage = null }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc('update_user_password', {
        email: supabase.auth.getUser().then(({ data }) => data.user?.email),
        new_password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage('Contraseña actualizada exitosamente');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      setError((error as Error).message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="newPassword" className="sr-only">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Nueva contraseña"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Confirmar contraseña"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </>
  );
}), { ssr: false });

export default ResetPasswordForm;