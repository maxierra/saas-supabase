import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { title: 'Inicio', path: '/dashboard', icon: '🏠' },
    { title: 'Productos', path: '/dashboard/productos', icon: '📦' },
    { title: 'Ventas', path: '/dashboard/ventas', icon: '💰' },
    { title: 'Caja Diaria', path: '/dashboard/caja', icon: '💵' },
    { title: 'Reportes', path: '/dashboard/reportes', icon: '📊' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-500 to-blue-700 shadow-lg text-white">
        <div className="p-4 text-xl font-bold border-b border-blue-400">Mi Dashboard</div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center px-4 py-2 text-white hover:bg-blue-600 transition-colors duration-200"
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-white hover:bg-blue-600 transition-colors duration-200"
          >
            <span className="mr-2">🚪</span>
            Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;