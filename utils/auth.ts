import { supabase } from '../lib/supabase';

interface PasswordResetResult {
  success: boolean;
  message: string;
}

export async function sendPasswordResetEmail(email: string): Promise<PasswordResetResult> {
  try {
    if (!email) {
      return {
        success: false,
        message: 'Por favor, ingresa tu correo electrónico',
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Se ha enviado un correo para restablecer tu contraseña',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error al enviar el correo de restablecimiento',
    };
  }
}