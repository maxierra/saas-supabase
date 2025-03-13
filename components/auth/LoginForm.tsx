'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

// Cliente con rol de servicio para operaciones privilegiadas
const supabaseAdmin = createClient(
  'https://crtgzjzzqrxyizraqpyk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTM0NjAwMiwiZXhwIjoyMDU2OTIyMDAyfQ.22ZOF3U4NQ6cdbDTNFi367OG7oi7ocumixatwLICF10'
);

interface LoginFormProps {
  message?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ message }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResetForm, setShowResetForm] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const router = useRouter();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('🔑 Login - Intentando iniciar sesión con:', email);

    try {
      console.log('🔐 Login - Llamando a signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login - Error de autenticación:', error);
        throw error;
      }

      console.log('✅ Login - Autenticación exitosa:', data);

      if (data.user) {
        console.log('👤 Login - Usuario autenticado:', data.user.id);
        
        // Verificar que la sesión se estableció correctamente
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !currentSession) {
          console.error('❌ Login - Error al establecer la sesión:', sessionError);
          setError('Error al establecer la sesión');
          return;
        }
        console.log('🍪 Login - Sesión establecida correctamente');

        // Verificar suscripción existente
        console.log('📑 Login - Buscando suscripción para:', data.user.id);
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('suscripciones')
          .select('estado')
          .eq('uid', data.user.id)
          .single();

        console.log('📑 Login - Suscripción encontrada:', subscription);

        // Determinar la URL de redirección basada en el estado de la suscripción
        if (!subscription || (subscription.estado !== 'active' && subscription.estado !== 'trial')) {
          console.log('⚠️ Login - Suscripción inactiva o no encontrada, redirigiendo a página de pago');
          router.push('/subscription?expired=true');
          return;
        }

        // Si la suscripción es válida (active o trial), redirigir al dashboard
        const dashboardUrl = `/${data.user.id}/dashboard`;
        console.log('✅ Login - Suscripción válida, redirigiendo a:', dashboardUrl);
        router.push(dashboardUrl);
      }
    } catch (error: unknown) {
      console.error('🔴 Login - Error general:', error);
      setError((error as Error).message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const toggleResetForm = () => {
    setShowResetForm(!showResetForm);
    setError(null);
    setResetMessage(null);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    if (!origin) {
      setError('Error: No se pudo determinar la URL de la aplicación');
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage('Se ha enviado un enlace de recuperación a tu correo electrónico');
      setShowResetForm(false);
    } catch (error: unknown) {
      setError((error as Error).message || 'Error al enviar el enlace de recuperación');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}

      {resetMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="text-sm text-green-700">{resetMessage}</div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {!showResetForm ? (
        <>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full rounded-t-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Correo electrónico"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full rounded-b-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <button
                type="button"
                onClick={toggleResetForm}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Regístrate
              </Link>
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="mt-1">
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400"
            >
              {resetLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button
              type="button"
              onClick={toggleResetForm}
              className="flex-1 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;