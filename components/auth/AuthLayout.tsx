'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import InfoModal from '../modals/InfoModal';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const pathname = usePathname();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [hasSeenInfo, setHasSeenInfo] = useState(false);
  
  // Verificar si el usuario ya ha visto el modal de información
  useEffect(() => {
    const infoSeen = localStorage.getItem('tienda360_info_seen');
    if (infoSeen) {
      setHasSeenInfo(true);
    }
  }, []);
  
  // Marcar que el usuario ha visto el modal
  const handleOpenModal = () => {
    setIsInfoModalOpen(true);
    localStorage.setItem('tienda360_info_seen', 'true');
    setHasSeenInfo(true);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center py-2 bg-gradient-to-r from-blue-500 to-blue-700">
      <div className="flex relative w-full max-w-4xl rounded-lg bg-white shadow-md overflow-hidden">
        {/* Left panel with features and testimonial */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-blue-500 to-blue-700 p-10 text-white flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-2xl font-bold">Tienda360</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Analítica en tiempo real</h3>
                  <p className="text-sm opacity-75">Visualiza el rendimiento de tu negocio al instante</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div>
                  <h3 className="font-semibold">Gestión de inventario</h3>
                  <p className="text-sm opacity-75">Control total de productos y existencias</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Administración de clientes</h3>
                  <p className="text-sm opacity-75">Fideliza a tus clientes con nuestras herramientas</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Banner de prueba premium */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="text-lg font-bold text-white">¡Prueba Premium GRATIS!</h3>
              </div>
              <p className="text-sm text-white mb-2">Accede a todas las funciones durante 30 días</p>
              <div className="flex justify-end">
                <button className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-100 transition-colors">
                  SIN TARJETA
                </button>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="bg-white/10 p-6 rounded-lg">
              <p className="italic text-sm">&quot;Tienda360 ha revolucionado la forma en que manejamos nuestro negocio. Incrementamos ventas en un 35% el primer trimestre.&quot;</p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-300"></div>
                <div>
                  <p className="font-semibold">María Rodríguez</p>
                  <p className="text-sm opacity-75">Dueña, Boutique Eleganza</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="w-full md:w-1/2 p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={handleOpenModal}
              className="flex items-center px-3 py-2 rounded-full text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            >
              <InformationCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Sobre Tienda360</span>
              {!hasSeenInfo && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              )}
            </button>
          </div>
          
          <div className="flex justify-center space-x-2 mb-6">
            <Link href="/login" className={`px-4 py-2 text-sm font-medium ${pathname === '/login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}>
              Iniciar Sesión
            </Link>
            <Link href="/register" className={`px-4 py-2 text-sm font-medium ${pathname === '/register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}>
              Registrarse
            </Link>
            <Link href="/reset-password" className={`px-4 py-2 text-sm font-medium ${pathname === '/reset-password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}>
              Recuperar
            </Link>
          </div>

          {children}
          
          {/* Botón de descarga del manual */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <a 
              href="/docs/Manual de Uso y Características de Tienda360.pdf" 
              download
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Descargar Manual de Usuario
            </a>
            <p className="text-xs text-center text-gray-500 mt-2">
              Descarga nuestro manual completo para aprovechar al máximo todas las funcionalidades de Tienda360
            </p>
          </div>
        </div>
      </div>
      {/* Imagen POS a la derecha del formulario */}
      <div className="hidden lg:block relative ml-4" style={{ height: '100%' }}>
        <div className="relative h-full" style={{ minHeight: '615px', width: '400px' }}>
          <Image
            src="/pos.jpg"
            alt="POS System"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
      
      {/* Modal Informativo */}
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </div>
  );
};

export default AuthLayout;