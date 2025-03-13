'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  TruckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  userUid: string;
}

const Sidebar = ({ userUid }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: `/${userUid}/dashboard`, icon: HomeIcon },
    { name: 'Ventas', href: `/${userUid}/ventas`, icon: ShoppingCartIcon },
    { name: 'Productos', href: `/${userUid}/productos`, icon: CubeIcon },
    { name: 'Proveedores', href: `/${userUid}/proveedores`, icon: TruckIcon },
    { name: 'Caja', href: `/${userUid}/caja`, icon: CreditCardIcon },
    { name: 'Configuraciones', href: `/${userUid}/configuraciones`, icon: Cog6ToothIcon },
    { name: 'Generación de Etiquetas', href: `/${userUid}/etiquetas`, icon: TagIcon },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className={`bg-indigo-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16 sm:w-20' : 'w-48 sm:w-64'} min-h-screen flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-indigo-700">
        {!isCollapsed && <h1 className="text-lg sm:text-xl font-bold">Tienda360</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-indigo-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 ${isActive ? 'bg-indigo-900' : 'hover:bg-indigo-700'} transition-colors duration-200`}
                >
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-sm sm:text-base">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <button 
          onClick={handleSignOut}
          className={`flex items-center px-4 py-3 w-full text-left hover:bg-indigo-700 rounded transition-colors duration-200`}
        >
          <ArrowLeftOnRectangleIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span className="text-sm sm:text-base">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
