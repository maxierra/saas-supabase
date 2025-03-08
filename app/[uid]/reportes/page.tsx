'use client';

import { useParams } from 'next/navigation';
import { Bar, Line } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportesPage() {
  const params = useParams();
  const uid = params.uid as string;
  
  // Datos para el gráfico de ventas por mes
  const ventasPorMes = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas 2024',
        data: [65000, 59000, 80000, 81000, 95000, 125000, 110000, 105000, 97000, 87000, 92000, 100000],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0,
      },
      {
        label: 'Ventas 2023',
        data: [55000, 49000, 70000, 71000, 85000, 115000, 100000, 95000, 87000, 77000, 82000, 90000],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0,
      },
    ],
  };

  // Datos para el gráfico de productos más vendidos
  const productosMasVendidos = {
    labels: ['Laptop HP', 'Samsung Galaxy', 'Auriculares BT', 'Monitor LG', 'Teclado Mec.'],
    datasets: [
      {
        label: 'Unidades vendidas',
        data: [120, 98, 85, 65, 45],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opciones para los gráficos
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
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-sm text-gray-600 mt-1 sm:mt-0">
          ID de usuario: {uid.substring(0, 8)}...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Ventas Mensuales</h2>
            <div className="mt-2 sm:mt-0">
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                <option>Últimos 12 meses</option>
                <option>Este año</option>
                <option>Año anterior</option>
              </select>
            </div>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line data={ventasPorMes} options={options} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Productos Más Vendidos</h2>
            <div className="mt-2 sm:mt-0">
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                <option>Este mes</option>
                <option>Último trimestre</option>
                <option>Este año</option>
              </select>
            </div>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={productosMasVendidos} options={options} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Resumen Financiero</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mes
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'].map((mes, index) => {
                const ingresos = [65000, 59000, 80000, 81000, 95000][index];
                const gastos = [45000, 40000, 55000, 60000, 65000][index];
                const beneficio = ingresos - gastos;
                const margen = (beneficio / ingresos) * 100;
                
                return (
                  <tr key={mes} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mes}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${ingresos.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${gastos.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${beneficio.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        margen > 30 ? 'bg-green-100 text-green-800' : 
                        margen > 20 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {margen.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
