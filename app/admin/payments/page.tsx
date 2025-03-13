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
  LineChart,
  Button,
  TextInput,
  DatePicker,
  Select,
  SelectItem,
} from '@tremor/react';
import { PlusCircle, Search } from 'lucide-react';

interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  payment_date: string;
  period_month: number;
  period_year: number;
  user_email?: string;
  created_at: string;
}

interface Subscription {
  id: string;
  uid: string;
  user_email: string;
  estado: 'trial' | 'active' | 'inactive';
}

interface ChartData {
  date: string;
  amount: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('suscripciones_con_usuarios')
        .select('id, uid, user_email, estado')
        .order('user_email');

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (err: any) {
      console.error('Error al cargar suscripciones:', err);
    }
  };

  const handleSubmitPayment = async (subscription: Subscription, month: number) => {
    try {
      setLoading(true);
      
      const currentDate = new Date();
      const { error } = await supabase
        .from('pagos')
        .insert({
          subscription_id: subscription.id,
          amount: 10000, // Monto fijo de $10,000
          payment_date: currentDate.toISOString(),
          period_month: month,
          period_year: currentDate.getFullYear()
        });

      if (error) throw error;

      await loadPayments();
      
      // Mostrar mensaje de éxito con el email del usuario
      setSuccessMessage(`✓ Pago de $10,000 registrado para ${subscription.user_email} - ${getMonthName(month)}`);

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(`Error al registrar pago: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  // Organizar pagos por usuario y mes
  const getPaymentsByUserAndMonth = () => {
    const paymentMap = new Map<string, { [key: number]: Payment }>(); // email -> { month -> payment }
    
    payments.forEach(payment => {
      const subscription = subscriptions.find(s => s.id === payment.subscription_id);
      if (!subscription) return;
      
      const userEmail = subscription.user_email;
      if (!paymentMap.has(userEmail)) {
        paymentMap.set(userEmail, {});
      }
      
      const userPayments = paymentMap.get(userEmail)!;
      userPayments[payment.period_month] = payment;
    });
    
    return paymentMap;
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Obtener pagos con emails de usuarios
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagos')
        .select(`
          *,
          suscripciones (
            uid
          )
        `)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Obtener emails de usuarios
      const userIds = paymentsData?.map(payment => payment.suscripciones?.uid).filter(Boolean) || [];
      const { data: usersData, error: usersError } = await supabase
        .from('suscripciones_con_usuarios')
        .select('uid, user_email')
        .in('uid', userIds);

      if (usersError) throw usersError;

      // Mapear emails a pagos
      const paymentsWithEmails = paymentsData?.map(payment => {
        const user = usersData?.find(u => u.uid === payment.suscripciones?.uid);
        return {
          ...payment,
          user_email: user?.user_email
        };
      });

      setPayments(paymentsWithEmails || []);

      // Preparar datos para el gráfico
      const groupedPayments = groupPaymentsByDate(paymentsWithEmails || [], selectedPeriod);
      setChartData(groupedPayments);

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupPaymentsByDate = (payments: Payment[], period: 'week' | 'month' | 'year') => {
    const grouped = payments.reduce((acc: { [key: string]: number }, payment) => {
      const date = new Date(payment.payment_date);
      let key = '';

      switch (period) {
        case 'week':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        case 'year':
          key = date.getFullYear().toString(); // YYYY
          break;
      }

      acc[key] = (acc[key] || 0) + Number(payment.amount);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  if (loading) return <div className="flex justify-center p-8">Cargando pagos...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const averageAmount = totalAmount / (payments.length || 1);

  // Filtrar suscripciones por término de búsqueda
  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <button
          onClick={loadPayments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Datos
        </button>
      </div>

      {/* Resumen de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Text>Total Pagos</Text>
          <Title>${totalAmount.toLocaleString()}</Title>
        </Card>
        <Card className="p-6">
          <Text>Promedio por Pago</Text>
          <Title>${averageAmount.toFixed(2)}</Title>
        </Card>
        <Card className="p-6">
          <Text>Cantidad de Pagos</Text>
          <Title>{payments.length}</Title>
        </Card>
      </div>

      {/* Gráfico de pagos */}
      <Card>
        <div className="p-6">
          <Title>Evolución de Pagos</Title>
          <TabGroup className="mt-4">
            <TabList>
              <Tab>Última Semana</Tab>
              <Tab>Último Mes</Tab>
              <Tab>Último Año</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <LineChart
                  data={chartData}
                  index="date"
                  categories={['amount']}
                  colors={['blue']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  yAxisWidth={60}
                />
              </TabPanel>
              <TabPanel>
                <LineChart
                  data={chartData}
                  index="date"
                  categories={['amount']}
                  colors={['blue']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  yAxisWidth={60}
                />
              </TabPanel>
              <TabPanel>
                <LineChart
                  data={chartData}
                  index="date"
                  categories={['amount']}
                  colors={['blue']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  yAxisWidth={60}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </Card>

      {/* Tabla de pagos por mes */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-xl overflow-x-auto">
        <div className="p-6 min-w-max">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <Title className="text-2xl text-blue-900">Control de Pagos Mensuales</Title>
              <Text className="text-blue-600 font-semibold">Monto fijo: $10,000</Text>
            </div>
            <div className="w-full md:w-1/3">
              <TextInput
                icon={Search}
                placeholder="Buscar usuario por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs">✓</span>
              <span>Pago registrado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-400 rounded-full text-xs">
                <PlusCircle className="w-3 h-3" />
              </span>
              <span>Registrar pago</span>
            </div>
          </div>

          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Text className="text-gray-500">No se encontraron usuarios</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`
                    p-4 rounded-lg shadow-md transition-all transform hover:scale-102 hover:shadow-lg
                    cursor-pointer border-2
                    ${sub.estado === 'active' 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300' 
                      : sub.estado === 'trial' 
                        ? 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 hover:border-blue-300'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300'
                    }
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    const month = new Date().getMonth() + 1;
                    handleSubmitPayment(sub, month);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate mb-1">
                        {sub.user_email}
                      </p>
                      <span
                        className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${sub.estado === 'active'
                            ? 'bg-green-100 text-green-800'
                            : sub.estado === 'trial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {sub.estado === 'active' ? '✓ Activo' :
                         sub.estado === 'trial' ? '⭐ Trial' : '⚠ Inactivo'}
                      </span>
                    </div>
                    <button
                      className={`
                        p-2 rounded-full transition-colors ml-4
                        ${sub.estado === 'active'
                          ? 'bg-green-100 hover:bg-green-200 text-green-700'
                          : sub.estado === 'trial'
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }
                      `}
                      title="Registrar pago de $10,000"
                    >
                      <PlusCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Tabla de pagos */}
      <Card>
        <div className="p-6">
          <Title>Historial de Pagos</Title>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.user_email || 'Usuario no encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(payment.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
