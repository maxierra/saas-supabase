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
    <div className="w-full">
      <div className="flex flex-col items-center w-full">
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
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
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
                      className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
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
                      className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
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
                  className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión →'}
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

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">O conéctate con</p>
              <div className="mt-3 flex justify-center space-x-4">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-[#1877F2]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-[#E4405F]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-[#FF0000]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </button>
              </div>
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

      </div>
    </div>
  );
};

export default LoginForm;