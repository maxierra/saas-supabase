'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import InfoModal from '../modals/InfoModal';
import UsoDelSistema from '../modals/Modal';
import SocialMediaIcons from '../SocialMediaIcons';

interface AuthLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  title: string;
}

const AuthLayout = ({ children, showNav = true, showHeader = true, title }: AuthLayoutProps) => {
  const pathname = usePathname();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [hasSeenInfo, setHasSeenInfo] = useState(false);
  const [isUsoModalOpen, setIsUsoModalOpen] = useState(false);

  useEffect(() => {
    const infoSeen = localStorage.getItem('tienda360_info_seen');
    if (infoSeen) {
      setHasSeenInfo(true);
    }
  }, []);

  const handleOpenModal = () => {
    setIsInfoModalOpen(true);
    localStorage.setItem('tienda360_info_seen', 'true');
    setHasSeenInfo(true);
  };

  const handleOpenUsoModal = () => {
    setIsUsoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
      <div className="flex gap-8 w-full max-w-5xl">
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-xl p-8">
          <div className="relative w-full h-full">
            <Image
              src="/newlogo.jpg"
              alt="Logo"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-2xl"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Tienda 360</h1>
              <p className="text-gray-500 text-sm mt-2">Accede a tu cuenta para continuar</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <Link href="/login" 
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-all duration-200 ${pathname === '/login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Iniciar Sesión
              </Link>
              <Link href="/register"
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-all duration-200 ${pathname === '/register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Registrarse
              </Link>
              <Link href="/reset-password"
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-all duration-200 ${pathname === '/reset-password' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Recuperar
              </Link>
            </div>

            {children}

            {/* Modals */}
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
            <UsoDelSistema isOpen={isUsoModalOpen} onRequestClose={() => setIsUsoModalOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;