'use client';

import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

export default function ResetPassword() {
  return (
    <AuthLayout title="Recupera tu contraseña">
      <ResetPasswordForm />
    </AuthLayout>
  );
}