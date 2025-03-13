'use client';

import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { CurrencyDollarIcon, CreditCardIcon, ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  // Mock data for demonstration
  const salesData = {
    totalSales: 125000,
    totalTransactions: 450,
    averageTicket: 277.78,
    growthRate: 15.5,
  };

  // Simplified data for charts
  const pieData = {
    labels: ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'MercadoPago'],
    datasets: [
      {
        label: 'Métodos de Pago',
        data: [30, 25, 20, 25],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(99, 102, 241, 0.7)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas Diarias',
        data: [12000, 19000, 15000, 17000, 22000, 25000, 15000],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: [65000, 59000, 80000, 81000, 95000, 125000],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0,
      },
    ],
  };

  // Simplified options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          // This more specific font property overrides the global property
          font: {
            size: 12
          },
          boxWidth: 15
        }
      },
      tooltip: {
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 14
        }
      }
    },
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">Dashboard de Ventas</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Ventas Totales</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                ${salesData.totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Transacciones</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                {salesData.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Ticket Promedio</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                ${salesData.averageTicket.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Crecimiento</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                {salesData.growthRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Métodos de Pago</h2>
          <div style={{ height: '250px', position: 'relative' }}>
            <Pie data={pieData} options={options} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Ventas Mensuales</h2>
          <div style={{ height: '250px', position: 'relative' }}>
            <Line data={lineData} options={options} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Ventas Diarias</h2>
          <div style={{ height: '250px', position: 'relative' }}>
            <Bar data={barData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;