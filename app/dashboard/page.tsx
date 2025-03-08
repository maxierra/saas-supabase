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

  const paymentMethodsData = {
    labels: ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'MercadoPago'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'],
        borderWidth: 1,
      },
    ],
  };

  const monthlySalesData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: [65000, 59000, 80000, 81000, 95000, 125000],
        fill: false,
        borderColor: '#4F46E5',
        tension: 0.1,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const dailySalesData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas Diarias',
        data: [12000, 19000, 15000, 17000, 22000, 25000, 15000],
        backgroundColor: '#10B981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard de Ventas</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${salesData.totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transacciones</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${salesData.averageTicket.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Crecimiento</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.growthRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pago</h2>
          <div className="h-80">
            <Pie data={paymentMethodsData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ventas Mensuales</h2>
          <div className="h-80">
            <Line data={monthlySalesData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ventas Diarias</h2>
          <div className="h-80">
            <Bar data={dailySalesData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;