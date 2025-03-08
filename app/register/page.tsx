'use client';

import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export default function Register() {
  return (
    <AuthLayout title="Crea tu cuenta">
      <RegisterForm />
    </AuthLayout>
  );
}