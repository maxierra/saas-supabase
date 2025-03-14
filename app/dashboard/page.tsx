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
  Filler,
} from 'chart.js';
import { CurrencyDollarIcon, CreditCardIcon, ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
  saldoCaja: number;
  totalProfit: number;
  profitPercentage: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

interface DailySale {
  day: string;
  dayName: string;
  amount: number;
}

interface MonthlySale {
  month: string;
  monthName: string;
  amount: number;
}

const DashboardPage = () => {
  const params = useParams();
  const uid = params.uid as string;
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageTicket: 0,
    saldoCaja: 0,
    totalProfit: 0,
    profitPercentage: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || 'Usuario');
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('Fecha seleccionada:', selectedDate);
        
        // Crear fechas en UTC para la consulta
        const startDate = new Date(selectedDate);
        startDate.setUTCHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setUTCHours(23, 59, 59, 999);

        console.log('Consultando datos entre:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        // Obtener ventas del día con detalles de productos
        let { data: ventasHoy, error: ventasError } = await supabase
          .from('ventas')
          .select('*, detalle_ventas(*)')
          .eq('uid', uid)
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());

        if (ventasError) {
          console.error('Error al cargar ventas:', ventasError);
        }

        // Si no hay resultados, intentar con un enfoque alternativo
        if (!ventasHoy || ventasHoy.length === 0) {
          console.log('No se encontraron ventas con el rango de fechas. Intentando con un enfoque alternativo...');
          
          // Intentar con un formato de fecha simple para la consulta
          const dateStr = selectedDate; // YYYY-MM-DD
          
          const { data: ventasAlternativas, error: ventasAlternativasError } = await supabase
            .from('ventas')
            .select('*, detalle_ventas(*)')
            .eq('uid', uid)
            .ilike('fecha', `${dateStr}%`); // Buscar por el prefijo de la fecha
            
          if (ventasAlternativasError) {
            console.error('Error al cargar ventas con enfoque alternativo:', ventasAlternativasError);
          } else if (ventasAlternativas && ventasAlternativas.length > 0) {
            console.log('Ventas encontradas con enfoque alternativo:', ventasAlternativas);
            ventasHoy = ventasAlternativas;
          } else {
            console.log('No se encontraron ventas para la fecha seleccionada con ningún método.');
          }
        }

        // Calcular estadísticas de ventas
        if (ventasHoy && ventasHoy.length > 0) {
          const totalSales = ventasHoy.reduce((sum, venta) => sum + (venta.total || 0), 0);
          const totalTransactions = ventasHoy.length;
          const averageTicket = totalSales / totalTransactions;

          setSalesStats(prev => ({
            ...prev,
            totalSales,
            totalTransactions,
            averageTicket
          }));

          // Obtener todos los métodos de pago configurados
          const { data: metodosConfigurados, error: metodosError } = await supabase
            .from('metodos_pago')
            .select('*')
            .eq('uid', uid);

          if (metodosError) {
            console.error('Error al cargar métodos de pago:', metodosError);
          }

          // Inicializar conteo de métodos de pago
          const methodCounts: { [key: string]: number } = {};
          
          // Inicializar todos los métodos configurados con 0
          if (metodosConfigurados) {
            metodosConfigurados.forEach(metodo => {
              methodCounts[metodo.nombre] = 0;
            });
          }

          // Contar las ventas por método de pago
          ventasHoy.forEach(venta => {
            const method = venta.metodo_pago || 'No especificado';
            methodCounts[method] = (methodCounts[method] || 0) + (venta.total || 0);
          });

          const paymentMethodStats = Object.entries(methodCounts).map(([method, amount]) => ({
            method,
            count: amount,
            percentage: totalSales > 0 ? (amount / totalSales) * 100 : 0
          }));

          setPaymentMethods(paymentMethodStats);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setIsLoading(false);
      }
    };

    getUserProfile();
    loadData();
  }, [uid, selectedDate]);

  // Simplified options for charts
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          boxWidth: 15
        }
      },
      tooltip: {
        bodyFont: { size: 13 },
        titleFont: { size: 14 }
      }
    },
  };

  // Prepare chart data
  const pieData = {
    labels: paymentMethods.map(pm => pm.method),
    datasets: [{
      label: 'Métodos de Pago',
      data: paymentMethods.map(pm => pm.count),
      backgroundColor: [
        'rgba(79, 70, 229, 0.7)',  // TARJETA DE CREDITO - indigo
        'rgba(34, 197, 94, 0.7)',   // TARJETA DE DEBITO - green
        'rgba(99, 102, 241, 0.7)',  // MODO - purple
        'rgba(59, 130, 246, 0.7)',  // efectivo - blue
        'rgba(245, 158, 11, 0.7)',  // MERCADO PAGO - yellow
        'rgba(236, 72, 153, 0.7)',  // CUENTA DNI - pink
      ],
      borderColor: [
        'rgba(79, 70, 229, 1)',    // TARJETA DE CREDITO - indigo
        'rgba(34, 197, 94, 1)',     // TARJETA DE DEBITO - green
        'rgba(99, 102, 241, 1)',    // MODO - purple
        'rgba(59, 130, 246, 1)',    // efectivo - blue
        'rgba(245, 158, 11, 1)',    // MERCADO PAGO - yellow
        'rgba(236, 72, 153, 1)',    // CUENTA DNI - pink
      ],
      borderWidth: 1,
    }],
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard de Ventas</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md p-2"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Ventas Totales</p>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                    ${salesStats.totalSales.toLocaleString()}
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
                    {salesStats.totalTransactions}
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
                    ${salesStats.averageTicket.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Saldo en Caja</p>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                    ${salesStats.saldoCaja.toFixed(2)}
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
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;