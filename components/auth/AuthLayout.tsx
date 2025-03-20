'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import SocialMediaIcons from '../SocialMediaIcons';

interface AuthLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showNav = true, showHeader = true, title }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 text-lg font-semibold">
            <Link href="/" className="flex items-center gap-2">
              <span className="gradient-text font-bold">Tienda360</span>
            </Link>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="#sobre-nosotros" className="text-sm font-medium transition-colors hover:text-primary">
              Sobre Nosotros
            </Link>
            <Link href="#preguntas-frecuentes" className="text-sm font-medium transition-colors hover:text-primary">
              Preguntas Frecuentes
            </Link>
            <Link href="#videotutoriales" className="text-sm font-medium transition-colors hover:text-primary">
              Videotutoriales
            </Link>
            <Link href="#precios" className="text-sm font-medium transition-colors hover:text-primary">
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <SocialMediaIcons />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="flex gap-8 justify-center items-center">
            <div className="w-[450px] h-[600px] relative hidden md:block">
              <Image
                src="/newlogo.jpg"
                alt="Logo"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="w-[450px] bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm text-gray-600">Gestiona tu negocio de manera eficiente</p>
              </div>

              <div className="flex justify-center space-x-4 mb-8">
                <Link href="/login" 
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/login' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>
                  Iniciar Sesión
                </Link>
                <Link href="/register"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/register' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>
                  Registrarse
                </Link>
                <Link href="/reset-password"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/reset-password' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}>
                  Recuperar
                </Link>
              </div>

              {children}
            </div>
          </div>

          <section id="sobre-nosotros" className="py-16 bg-white rounded-lg shadow-xl mt-16 p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Sobre Nosotros</h2>
            
            <div className="space-y-8 max-w-3xl mx-auto">
              <div>
                <h3 className="text-2xl font-semibold text-center mb-4">Nuestra Historia</h3>
                <p className="text-lg text-gray-600 text-center">
                  Somos una empresa dedicada a proporcionar soluciones innovadoras para nuestros clientes. Fundada en 2024, 
                  hemos crecido constantemente, siempre manteniendo nuestro compromiso con la calidad y la excelencia.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-center mb-4">Nuestra Misión</h3>
                <p className="text-lg text-gray-600 text-center">
                  Proporcionar soluciones innovadoras que mejoren la vida de nuestros clientes y contribuyan al desarrollo sostenible.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-center mb-4">Nuestra Visión</h3>
                <p className="text-lg text-gray-600 text-center">
                  Ser líderes en nuestro sector, reconocidos por nuestra excelencia, innovación y compromiso con la satisfacción del cliente.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-center mb-4">Nuestros Valores</h3>
                <ul className="text-lg text-gray-600 space-y-2 list-none text-center">
                  <li>Integridad y transparencia</li>
                  <li>Innovación constante</li>
                  <li>Compromiso con la calidad</li>
                  <li>Responsabilidad social</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="preguntas-frecuentes" className="py-16 bg-white rounded-lg shadow-xl mt-16 p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">¿Cómo puedo empezar?</h3>
                <p className="text-gray-600">Simplemente regístrate en nuestra plataforma y comienza a explorar todas nuestras funcionalidades.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">¿Qué métodos de pago aceptan?</h3>
                <p className="text-gray-600">Aceptamos múltiples métodos de pago, incluyendo tarjetas de crédito y transferencias bancarias.</p>
              </div>
            </div>
          </section>

          <section id="videotutoriales" className="py-16 bg-white rounded-lg shadow-xl mt-16 p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Videotutoriales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Registro y Login</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/TzBls9UBwgY"
                    title="Registro y Login"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Aprende a registrarte y acceder al sistema.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Configuraciones Principales</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/fKK62jAPARg"
                    title="Configuraciones Principales"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Configura los aspectos básicos de tu tienda.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Carga de Productos</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/ZSxP-OwR2LQ"
                    title="Carga de Productos"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Aprende a cargar y gestionar tus productos.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Primera Venta</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/Uv9GtrG9WxU"
                    title="Primera Venta"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Realiza tu primera venta en el sistema.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Gestión de Caja</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/SpMKGPPb7QY"
                    title="Gestión de Caja"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Maneja tu caja diaria eficientemente.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Proveedores</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/trV_96OpTsY"
                    title="Proveedores"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Gestiona tus proveedores y pedidos.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Etiquetas</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/jIqfFsukDx4"
                    title="Etiquetas"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Genera etiquetas para tus productos.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-4">Dashboard</h3>
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/qH84WY-vPlM"
                    title="Dashboard"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600">Explora el panel de control principal.</p>
              </div>
            </div>
          </section>

          <section id="precios" className="py-16 bg-white rounded-lg shadow-xl mt-16 mb-16 p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Plan Único</h2>
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 p-8 rounded-lg text-center transform scale-105 shadow-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow-md animate-pulse">
                  ¡30 días de prueba GRATIS!
                </div>
                <h3 className="font-semibold text-2xl mb-4 mt-4">Plan Completo</h3>
                <p className="text-4xl font-bold mb-6">$20.000 ARS/mes</p>
                <div className="text-gray-600 space-y-4">
                  <h4 className="font-semibold text-lg text-gray-800">Módulos Incluidos:</h4>
                  <ul className="space-y-2">
                    <li>✓ Dashboard completo</li>
                    <li>✓ Gestión de ventas</li>
                    <li>✓ Control de productos</li>
                    <li>✓ Caja diaria</li>
                    <li>✓ Generación de etiquetas</li>
                    <li>✓ Gestión de proveedores</li>
                  </ul>
                  <h4 className="font-semibold text-lg text-gray-800 mt-6">Características Destacadas:</h4>
                  <ul className="space-y-2">
                    <li>✓ Almacenamiento en la nube PostgreSQL</li>
                    <li>✓ Seguridad avanzada de datos</li>
                    <li>✓ Soporte técnico prioritario</li>
                    <li>✓ Actualizaciones continuas</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-xl p-8">
        <div className="relative w-full h-full">
          <Image
            src="/logo.jpg"
            alt="Logo"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;