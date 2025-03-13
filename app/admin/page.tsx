'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  BarChart,
  DonutChart
} from '@tremor/react';
import { Users, CreditCard, TrendingUp } from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  trial: number;
  inactive: number;
  monthlyPayments: number;
}

interface ChartData {
  name: string;
  'Usuarios Activos': number;
  'Usuarios Trial': number;
  'Usuarios Inactivos': number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    trial: 0,
    inactive: 0,
    monthlyPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas de suscripciones
      const { data: subs, error: subsError } = await supabase
        .from('suscripciones')
        .select('estado, created_at');

      if (subsError) throw subsError;

      // Calcular estadísticas
      const stats = subs?.reduce((acc, sub) => {
        acc.total++;
        if (sub.estado === 'active') acc.active++;
        if (sub.estado === 'trial') acc.trial++;
        if (sub.estado === 'inactive') acc.inactive++;
        return acc;
      }, { total: 0, active: 0, trial: 0, inactive: 0, monthlyPayments: 0 });

      // Obtener pagos del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('pagos')
        .select('amount')
        .gte('payment_date', startOfMonth.toISOString());

      if (paymentsError) throw paymentsError;

      // Sumar pagos del mes
      stats.monthlyPayments = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      setStats(stats);

      // Preparar datos para el gráfico
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('es', { month: 'short', year: '2-digit' });
      }).reverse();

      const chartData = last6Months.map(month => ({
        name: month,
        'Usuarios Activos': Math.floor(Math.random() * 50) + 20,
        'Usuarios Trial': Math.floor(Math.random() * 30) + 10,
        'Usuarios Inactivos': Math.floor(Math.random() * 20) + 5,
      }));

      setChartData(chartData);

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Cargando estadísticas...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;

  const statusDonutData = [
    { name: 'Activos', value: stats.active },
    { name: 'Trial', value: stats.trial },
    { name: 'Inactivos', value: stats.inactive },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Datos
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <Text>Total Usuarios</Text>
              <Title>{stats.total}</Title>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <Text>Usuarios Activos</Text>
              <Title>{stats.active}</Title>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <Text>Usuarios Trial</Text>
              <Title>{stats.trial}</Title>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <Text>Ingresos del Mes</Text>
              <Title>${stats.monthlyPayments.toLocaleString()}</Title>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Distribución de Usuarios</Title>
          <DonutChart
            data={statusDonutData}
            category="value"
            index="name"
            colors={['green', 'blue', 'red']}
            className="mt-6"
          />
        </Card>

        <Card>
          <Title>Evolución de Usuarios</Title>
          <BarChart
            data={chartData}
            index="name"
            categories={['Usuarios Activos', 'Usuarios Trial', 'Usuarios Inactivos']}
            colors={['green', 'blue', 'red']}
            className="mt-6"
          />
        </Card>
      </div>
    </div>
  );
}
