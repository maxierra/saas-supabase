import Image from "next/image";

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de login cuando se carga la página principal
    router.push('/login');
  }, [router]);

  // No renderizamos nada aquí ya que redirigimos inmediatamente
  return null;
}
