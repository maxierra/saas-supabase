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
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

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
  const [dashboardTitle, setDashboardTitle] = useState('');

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
        
        // Crear fechas en UTC para la consulta (mismo enfoque que en la página de caja)
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

        console.log('Ventas obtenidas:', ventasHoy);

        // Obtener movimientos de caja del día para calcular saldo
        let { data: movimientosCaja, error: movimientosError } = await supabase
          .from('movimientos_caja')
          .select('*')
          .eq('uid', uid)
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());

        if (movimientosError) {
          console.error('Error al cargar movimientos de caja:', movimientosError);
        }

        // Si no hay resultados, intentar con un enfoque alternativo
        if (!movimientosCaja || movimientosCaja.length === 0) {
          console.log('No se encontraron movimientos con el rango de fechas. Intentando con un enfoque alternativo...');
          
          // Intentar con un formato de fecha simple para la consulta
          const dateStr = selectedDate; // YYYY-MM-DD
          
          const { data: movimientosAlternativos, error: movimientosAlternativosError } = await supabase
            .from('movimientos_caja')
            .select('*')
            .eq('uid', uid)
            .ilike('fecha', `${dateStr}%`); // Buscar por el prefijo de la fecha
            
          if (movimientosAlternativosError) {
            console.error('Error al cargar movimientos con enfoque alternativo:', movimientosAlternativosError);
          } else if (movimientosAlternativos && movimientosAlternativos.length > 0) {
            console.log('Movimientos encontrados con enfoque alternativo:', movimientosAlternativos);
            movimientosCaja = movimientosAlternativos;
          } else {
            console.log('No se encontraron movimientos para la fecha seleccionada con ningún método.');
          }
        }

        // Calcular ingresos y egresos del día
        const ingresos = movimientosCaja 
          ? movimientosCaja.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0) 
          : 0;
        
        const egresos = movimientosCaja 
          ? movimientosCaja.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0) 
          : 0;
        
        // Calcular saldo actual (ingresos - egresos)
        const saldoCaja = ingresos - egresos;

        // Calcular estadísticas básicas
        const totalVentas = ventasHoy ? ventasHoy.reduce((sum, venta) => sum + (venta.total || 0), 0) : 0;
        const numTransacciones = ventasHoy ? ventasHoy.length : 0;
        const ticketPromedio = numTransacciones > 0 ? totalVentas / numTransacciones : 0;
        
        // Obtener todos los productos para calcular el profit real
        const { data: productos, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .eq('uid', uid);
          
        if (productosError) {
          console.error('Error al cargar productos:', productosError);
        }
        
        // Crear un mapa de productos para búsqueda rápida
        const productosMap: Record<string, {
          id: string;
          precio_compra: number;
          precio_venta: number;
          nombre: string;
        }> = {};
        if (productos) {
          productos.forEach(producto => {
            productosMap[producto.id] = producto;
          });
        }
        
        // Calcular el profit real basado en los detalles de venta
        let costoTotal = 0;
        let ventaTotal = 0;
        
        if (ventasHoy && ventasHoy.length > 0) {
          ventasHoy.forEach(venta => {
            if (venta.detalle_ventas && venta.detalle_ventas.length > 0) {
              venta.detalle_ventas.forEach((detalle: {
                producto_id: string;
                cantidad: number;
              }) => {
                const producto = detalle.producto_id ? productosMap[detalle.producto_id] : null;
                if (producto) {
                  const cantidad = detalle.cantidad || 1;
                  costoTotal += (producto.precio_compra || 0) * cantidad;
                  ventaTotal += (producto.precio_venta || 0) * cantidad;
                }
              });
            }
          });
        }
        
        // Si no hay detalles de venta disponibles, usamos el método simplificado
        if (ventaTotal === 0) {
          ventaTotal = totalVentas;
          costoTotal = totalVentas * 0.5; // Asumimos 50% como fallback
        }
        
        const totalProfit = ventaTotal - costoTotal;
        const profitPercentage = ventaTotal > 0 ? Math.round((totalProfit / ventaTotal) * 100) : 0;

        setSalesStats({
          totalSales: totalVentas,
          totalTransactions: numTransacciones,
          averageTicket: ticketPromedio,
          saldoCaja: saldoCaja,
          totalProfit: totalProfit,
          profitPercentage: profitPercentage
        });

        // Calcular métodos de pago
        if (ventasHoy && ventasHoy.length > 0) {
          const paymentMethodsCount: Record<string, number> = {};
          ventasHoy.forEach(venta => {
            const method = venta.metodo_pago || 'Efectivo';
            paymentMethodsCount[method] = (paymentMethodsCount[method] || 0) + 1;
          });
          
          const totalCount = ventasHoy.length;
          const paymentMethodsArray: PaymentMethod[] = Object.keys(paymentMethodsCount).map(method => ({
            method,
            count: paymentMethodsCount[method],
            percentage: Math.round((paymentMethodsCount[method] / totalCount) * 100)
          }));
          
          setPaymentMethods(paymentMethodsArray);
        } else {
          setPaymentMethods([]);
        }

        // Obtener ventas de los últimos 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        
        const { data: ventasUltimos7Dias, error: ventasSemanalesError } = await supabase
          .from('ventas')
          .select('fecha, total')
          .eq('uid', uid)
          .gte('fecha', sevenDaysAgo.toISOString())
          .order('fecha', { ascending: true });
        
        if (ventasSemanalesError) {
          console.error('Error al cargar ventas semanales:', ventasSemanalesError);
        }
        
        // Agrupar ventas por día
        const ventasPorDia: Record<string, any> = {};
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        // Inicializar los últimos 7 días
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayKey = date.toISOString().split('T')[0];
          const dayName = days[date.getDay()];
          ventasPorDia[dayKey] = { amount: 0, dayName };
        }
        
        // Sumar ventas por día
        if (ventasUltimos7Dias) {
          ventasUltimos7Dias.forEach(venta => {
            const date = new Date(venta.fecha);
            const dayKey = date.toISOString().split('T')[0];
            if (ventasPorDia[dayKey]) {
              ventasPorDia[dayKey].amount += venta.total || 0;
            }
          });
        }
        
        // Convertir a array para el gráfico
        const dailySalesArray: DailySale[] = Object.keys(ventasPorDia)
          .sort()
          .map(day => ({
            day,
            dayName: ventasPorDia[day].dayName,
            amount: ventasPorDia[day].amount
          }));
        
        setDailySales(dailySalesArray);

        // Obtener ventas de los últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        
        const { data: ventasUltimos6Meses, error: ventasMensualesError } = await supabase
          .from('ventas')
          .select('fecha, total')
          .eq('uid', uid)
          .gte('fecha', sixMonthsAgo.toISOString())
          .order('fecha', { ascending: true });
        
        if (ventasMensualesError) {
          console.error('Error al cargar ventas mensuales:', ventasMensualesError);
        }
        
        // Agrupar ventas por mes
        const ventasPorMes: Record<string, any> = {};
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Inicializar los últimos 6 meses
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = months[date.getMonth()];
          ventasPorMes[monthKey] = { amount: 0, monthName };
        }
        
        // Sumar ventas por mes
        if (ventasUltimos6Meses) {
          ventasUltimos6Meses.forEach(venta => {
            const date = new Date(venta.fecha);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (ventasPorMes[monthKey]) {
              ventasPorMes[monthKey].amount += venta.total || 0;
            }
          });
        }
        
        // Convertir a array para el gráfico
        const monthlySalesArray: MonthlySale[] = Object.keys(ventasPorMes)
          .sort()
          .map(month => ({
            month,
            monthName: ventasPorMes[month].monthName,
            amount: ventasPorMes[month].amount
          }));
        
        setMonthlySales(monthlySalesArray);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
    loadData();
    
    // Solución simple para el título del dashboard
    // Crear la fecha a partir de los componentes para evitar problemas de zona horaria
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day); // Mes es 0-indexado en JS
    
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[dateObj.getDay()];
    
    // Formatear fecha manualmente
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    setDashboardTitle(`Dashboard | ${dayName} ${formattedDate}`);
    
    console.log('Fecha seleccionada:', selectedDate);
    console.log('Fecha para título:', formattedDate);
  }, [selectedDate]);

  // Datos para el gráfico de métodos de pago
  const pieData = {
    labels: paymentMethods.map(pm => pm.method),
    datasets: [
      {
        label: 'Métodos de Pago',
        data: paymentMethods.map(pm => pm.percentage),
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de ventas diarias (semana actual)
  const barData = {
    labels: dailySales.map(day => day.dayName),
    datasets: [
      {
        label: 'Ventas Diarias',
        data: dailySales.map(day => day.amount),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de tendencia mensual
  const lineData = {
    labels: monthlySales.map(month => month.monthName),
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: monthlySales.map(month => month.amount),
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
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {dashboardTitle}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenido, {userName}
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <input
            type="date"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Ventas de Hoy</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  `$${salesStats.totalSales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
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
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  salesStats.totalTransactions
                )}
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
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  `$${salesStats.averageTicket.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
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
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  `$${salesStats.saldoCaja.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ganancia Total</h2>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  `$${salesStats.totalProfit.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Margen de Ganancia</h2>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? (
                  <span className="text-gray-400">Cargando...</span>
                ) : (
                  `${salesStats.profitPercentage}%`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Métodos de Pago</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-400">Cargando datos...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-500">No hay datos de métodos de pago disponibles</p>
            </div>
          ) : (
            <div style={{ height: '250px', position: 'relative' }}>
              <Pie data={pieData} options={options} />
            </div>
          )}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Ventas Diarias</h2>
          <div style={{ height: '250px', position: 'relative' }}>
            <Bar data={barData} options={options} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Tendencia de Ventas</h2>
          <div style={{ height: '250px', position: 'relative' }}>
            <Line data={lineData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
