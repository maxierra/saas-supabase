'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

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
      console.log('🔄 Login - Llamando a signInWithPassword');
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
        // Obtener estado de suscripción
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('estado')
          .eq('uid', data.user.id)
          .single();

        console.log('💳 Login - Estado de suscripción:', subscriptionData);

        if (subscriptionError) {
          console.error('❌ Login - Error al verificar suscripción:', subscriptionError);
          setError('Error al verificar el estado de tu suscripción');
          return;
        }

        // Redirigir al usuario a su dashboard basado en su UID
        console.log('🔄 Login - Redirigiendo a dashboard');
        router.push(`/${data.user.id}/dashboard`);
      }
    } catch (error: unknown) {
      console.error('🔴 Login - Error general:', error);
      setError((error as Error).message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ... resto del código sin cambios ...
