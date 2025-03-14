'use client';

import { Bar, Pie, Line } from 'react-chartjs-2';
import type { NextPage } from 'next';
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
import { CurrencyDollarIcon, CreditCardIcon, ShoppingCartIcon, ArrowTrendingUpIcon, BanknotesIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
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

interface PaymentMethodAmount {
  method: string;
  amount: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

interface PendingOrder {
  id: string;
  proveedor_nombre: string;
  fecha_pedido: string;
  fecha_entrega_estimada: string;
  estado: string;
  total: number;
}

interface TopProduct {
  id: string;
  nombre: string;
  cantidad: number;
  total: number;
  porcentaje: number;
}

interface LowStockProduct {
  id: string;
  nombre: string;
  stock: number;
  precio_venta: number;
  categoria: string;
}

interface ExpiringProduct {
  id: string;
  nombre: string;
  codigo_barras: string;
  fecha_vencimiento: string;
  dias_restantes: number;
  categoria: string;
}

const DashboardPage: NextPage = () => {
  const params = useParams();
  const uid = params.uid as string;
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    // Ajustamos la fecha a la zona horaria local
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageTicket: 0,
    saldoCaja: 0,
    totalProfit: 0,
    profitPercentage: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodAmounts, setPaymentMethodAmounts] = useState<PaymentMethodAmount[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [dashboardTitle, setDashboardTitle] = useState('');
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [bottomProducts, setBottomProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>([]);
  const [stockThreshold, setStockThreshold] = useState<number>(10);
  const [loadingBottomProducts, setLoadingBottomProducts] = useState<boolean>(false);
  const [expirationDays, setExpirationDays] = useState<number>(14); // Valor por defecto: 14 días
  const expirationOptions = [7, 14, 21, 30]; // Opciones de días para el selector

  const loadData = useCallback(async () => {
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
        endDate: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      // Obtener ventas del día con detalles de productos
      let { data: ventasHoy, error: ventasError } = await supabase
        .from('ventas')
        .select('*, detalle_ventas(*)').order('fecha', { ascending: false })
        .eq('uid', uid)
        .gte('fecha', startDate.toISOString())
        .lte('fecha', endDate.toISOString());

      if (ventasError) {
        console.error('Error al cargar ventas:', ventasError);
      }

      // Si no hay resultados, no intentamos con el enfoque alternativo
      // ya que ilike no es compatible con campos timestamp
      // if (!ventasHoy || ventasHoy.length === 0) {
      //   const dateStr = selectedDate;
      //   const { data: ventasAlternativas, error: ventasAlternativasError } = await supabase
      //     .from('ventas')
      //     .select('*, detalle_ventas(*)').order('fecha', { ascending: false })
      //     .eq('uid', uid)
      //     .ilike('fecha', `${dateStr}%`);
      //     
      //   if (ventasAlternativasError) {
      //     console.error('Error al cargar ventas con enfoque alternativo:', ventasAlternativasError);
      //   } else if (ventasAlternativas && ventasAlternativas.length > 0) {
      //     ventasHoy = ventasAlternativas;
      //   }
      // }

      // ... Rest of the existing loadData implementation ...

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, uid]);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email?.split('@')[0] || 'Usuario');
      }
    };

    const fetchDashboardData = async () => {
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
          endDate: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Obtener ventas del día con detalles de productos
        const { data: ventasHoy, error: ventasError } = await supabase
          .from('ventas')
          .select('*, detalle_ventas(*)')
          .eq('uid', uid)
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());

        if (ventasError) {
          console.error('Error al cargar ventas:', ventasError);
          return;
        }

        console.log('Ventas obtenidas:', ventasHoy);

        // Obtener movimientos de caja del día
        const { data: movimientosCaja, error: movimientosError } = await supabase
          .from('movimientos_caja')
          .select('*')
          .eq('uid', uid)
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());

        if (movimientosError) {
          console.error('Error al cargar movimientos de caja:', movimientosError);
          return;
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
          const paymentMethodsAmount: Record<string, number> = {};
          
          ventasHoy.forEach(venta => {
            const method = venta.metodo_pago || 'Efectivo';
            paymentMethodsCount[method] = (paymentMethodsCount[method] || 0) + 1;
            paymentMethodsAmount[method] = (paymentMethodsAmount[method] || 0) + (venta.total || 0);
          });
          
          const totalCount = ventasHoy.length;
          const paymentMethodsArray: PaymentMethod[] = Object.keys(paymentMethodsCount).map(method => ({
            method,
            count: paymentMethodsCount[method],
            percentage: Math.round((paymentMethodsCount[method] / totalCount) * 100)
          }));
          
          setPaymentMethods(paymentMethodsArray);
          
          // Crear array de montos por método de pago para las tarjetas
          const getIconForMethod = (method: string) => {
            switch(method.toLowerCase()) {
              case 'efectivo':
                return <BanknotesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />;
              case 'tarjeta_credito':
              case 'tarjeta_crédito':
              case 'tarjeta crédito':
              case 'tarjeta credito':
                return <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8" />;
              case 'tarjeta_debito':
              case 'tarjeta_débito':
              case 'tarjeta débito':
              case 'tarjeta debito':
                return <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8" />;
              case 'mercado_pago':
              case 'mercadopago':
                return <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8" />;
              default:
                return <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8" />;
            }
          };
          
          const getColorForMethod = (method: string): {bg: string, text: string} => {
            switch(method.toLowerCase()) {
              case 'efectivo':
                return {bg: 'bg-indigo-100', text: 'text-indigo-600'};
              case 'tarjeta_credito':
              case 'tarjeta_crédito':
              case 'tarjeta crédito':
              case 'tarjeta credito':
                return {bg: 'bg-emerald-100', text: 'text-emerald-600'};
              case 'tarjeta_debito':
              case 'tarjeta_débito':
              case 'tarjeta débito':
              case 'tarjeta debito':
                return {bg: 'bg-amber-100', text: 'text-amber-600'};
              case 'mercado_pago':
              case 'mercadopago':
                return {bg: 'bg-blue-100', text: 'text-blue-600'};
              default:
                return {bg: 'bg-gray-100', text: 'text-gray-600'};
            }
          };
          
          const paymentMethodAmountsArray: PaymentMethodAmount[] = Object.keys(paymentMethodsAmount).map(method => {
            const colors = getColorForMethod(method);
            return {
              method,
              amount: paymentMethodsAmount[method],
              icon: getIconForMethod(method),
              bgColor: colors.bg,
              textColor: colors.text
            };
          });
          
          // Ordenar por monto, de mayor a menor
          paymentMethodAmountsArray.sort((a, b) => b.amount - a.amount);
          
          // Limitar a los 4 principales métodos de pago
          setPaymentMethodAmounts(paymentMethodAmountsArray.slice(0, 4));
        } else {
          setPaymentMethods([]);
          setPaymentMethodAmounts([]);
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

        // Obtener pedidos pendientes a proveedores
        const { data: pedidosPendientes, error: pedidosError } = await supabase
          .from('pedidos_proveedores')
          .select(`
            id,
            fecha_pedido,
            fecha_entrega_estimada,
            estado,
            total,
            proveedores (
              nombre
            )
          `)
          .eq('uid', uid)
          .in('estado', ['pendiente', 'en curso'])
          .order('fecha_entrega_estimada', { ascending: true })
          .limit(5);

        if (pedidosError) {
          console.error('Error al cargar pedidos pendientes:', pedidosError);
        }

        if (pedidosPendientes && pedidosPendientes.length > 0) {
          const formattedOrders: PendingOrder[] = pedidosPendientes.map((pedido: any) => ({
            id: pedido.id,
            proveedor_nombre: pedido.proveedores?.nombre || 'Proveedor sin nombre',
            fecha_pedido: new Date(pedido.fecha_pedido).toLocaleDateString('es-ES'),
            fecha_entrega_estimada: new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-ES'),
            estado: pedido.estado,
            total: pedido.total || 0
          }));
          setPendingOrders(formattedOrders);
        } else {
          setPendingOrders([]);
        }

        // Obtener productos más vendidos del período seleccionado
        if (ventasHoy && ventasHoy.length > 0) {
          // Crear un mapa para contar productos vendidos
          const productosVendidos: Record<string, {
            id: string;
            nombre: string;
            cantidad: number;
            total: number
          }> = {};
          
          // Sumar cantidades y montos por producto
          ventasHoy.forEach(venta => {
            if (venta.detalle_ventas && venta.detalle_ventas.length > 0) {
              venta.detalle_ventas.forEach((detalle: any) => {
                const productoId = detalle.producto_id;
                const producto = productoId ? productosMap[productoId] : null;
                
                if (producto) {
                  const cantidad = detalle.cantidad || 1;
                  const precioUnitario = producto.precio_venta || 0;
                  const totalProducto = precioUnitario * cantidad;
                  
                  if (!productosVendidos[productoId]) {
                    productosVendidos[productoId] = {
                      id: productoId,
                      nombre: producto.nombre || 'Producto sin nombre',
                      cantidad: 0,
                      total: 0
                    };
                  }
                  
                  productosVendidos[productoId].cantidad += cantidad;
                  productosVendidos[productoId].total += totalProducto;
                }
              });
            }
          });
          
          // Convertir a array y ordenar por cantidad vendida (de mayor a menor)
          const productosArray = Object.values(productosVendidos)
            .sort((a, b) => b.cantidad - a.cantidad);
          
          // Calcular el total de ventas para los porcentajes
          const totalVentasProductos = productosArray.reduce((sum, p) => sum + p.total, 0);
          
          // Formatear los 5 productos más vendidos con porcentajes
          const topProductsArray: TopProduct[] = productosArray
            .slice(0, 5)
            .map(p => ({
              id: p.id,
              nombre: p.nombre,
              cantidad: p.cantidad,
              total: p.total,
              porcentaje: totalVentasProductos > 0 
                ? Math.round((p.total / totalVentasProductos) * 100) 
                : 0
            }));
          
          setTopProducts(topProductsArray);
        } else {
          setTopProducts([]);
        }

        // Obtener productos menos vendidos
        if (ventasHoy && ventasHoy.length > 0) {
          // Crear un mapa para contar productos vendidos
          const productosVendidos: Record<string, {
            id: string;
            nombre: string;
            cantidad: number;
            total: number
          }> = {};
          
          // Sumar cantidades y montos por producto
          ventasHoy.forEach(venta => {
            if (venta.detalle_ventas && venta.detalle_ventas.length > 0) {
              venta.detalle_ventas.forEach((detalle: any) => {
                const productoId = detalle.producto_id;
                const producto = productoId ? productosMap[productoId] : null;
                
                if (producto) {
                  const cantidad = detalle.cantidad || 1;
                  const precioUnitario = producto.precio_venta || 0;
                  const totalProducto = precioUnitario * cantidad;
                  
                  if (!productosVendidos[productoId]) {
                    productosVendidos[productoId] = {
                      id: productoId,
                      nombre: producto.nombre || 'Producto sin nombre',
                      cantidad: 0,
                      total: 0
                    };
                  }
                  
                  productosVendidos[productoId].cantidad += cantidad;
                  productosVendidos[productoId].total += totalProducto;
                }
              });
            }
          });
          
          // Convertir a array y ordenar por cantidad vendida (de menor a mayor)
          const productosArray = Object.values(productosVendidos)
            .sort((a, b) => a.cantidad - b.cantidad);
          
          // Calcular el total de ventas para los porcentajes
          const totalVentasProductos = productosArray.reduce((sum, p) => sum + p.total, 0);
          
          // Formatear los 5 productos menos vendidos con porcentajes
          const bottomProductsArray: TopProduct[] = productosArray
            .slice(0, 5)
            .map(p => ({
              id: p.id,
              nombre: p.nombre,
              cantidad: p.cantidad,
              total: p.total,
              porcentaje: totalVentasProductos > 0 
                ? Math.round((p.total / totalVentasProductos) * 100) 
                : 0
            }));
          
          setBottomProducts(bottomProductsArray);
        } else {
          setBottomProducts([]);
        }

        // Obtener productos con bajo stock
        const { data: productosStock, error: productosStockError } = await supabase
          .from('productos')
          .select('*')
          .eq('uid', uid)
          .lt('stock', stockThreshold)
          .order('stock', { ascending: true });
        
        if (productosStockError) {
          console.error('Error al cargar productos con bajo stock:', productosStockError);
        }
        
        if (productosStock && productosStock.length > 0) {
          const lowStockProductsArray: LowStockProduct[] = productosStock.map(producto => ({
            id: producto.id,
            nombre: producto.nombre || 'Producto sin nombre',
            stock: producto.stock || 0,
            precio_venta: producto.precio_venta || 0,
            categoria: producto.categoria || 'Sin categoría'
          }));
          setLowStockProducts(lowStockProductsArray);
        } else {
          setLowStockProducts([]);
        }

        // Obtener productos con fecha de vencimiento cercana
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const futureDate = new Date(today); // Crear nueva fecha basada en today
        futureDate.setDate(futureDate.getDate() + expirationDays); // Primero ajustar los días
        futureDate.setUTCHours(23, 59, 59, 999); // Luego ajustar la hora

        // Agregar logs para debugging
        console.log('Consultando productos por vencer:', {
          desde: today.toISOString(),
          hasta: futureDate.toISOString(),
          diasSeleccionados: expirationDays,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        const { data: productosVencimiento, error: productosVencimientoError } = await supabase
          .from('productos')
          .select('*')
          .eq('uid', uid)
          .not('fecha_vencimiento', 'is', null)
          .lte('fecha_vencimiento', futureDate.toISOString())
          .gt('fecha_vencimiento', today.toISOString())
          .order('fecha_vencimiento', { ascending: true });
        
        if (productosVencimientoError) {
          console.error('Error al cargar productos con fecha de vencimiento cercana:', productosVencimientoError);
        }

        // Log de resultados
        console.log('Productos por vencer encontrados:', productosVencimiento);
        
        if (productosVencimiento && productosVencimiento.length > 0) {
          const expiringProductsArray: ExpiringProduct[] = productosVencimiento.map(producto => {
            const fechaVencimiento = new Date(producto.fecha_vencimiento);
            const diffTime = fechaVencimiento.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              id: producto.id,
              nombre: producto.nombre || 'Producto sin nombre',
              codigo_barras: producto.codigo_barras || 'N/A',
              fecha_vencimiento: producto.fecha_vencimiento || '',
              dias_restantes: diffDays,
              categoria: producto.categoria || 'Sin categoría'
            };
          });
          
          // Ordenar por días restantes (ascendente)
          expiringProductsArray.sort((a, b) => a.dias_restantes - b.dias_restantes);
          
          setExpiringProducts(expiringProductsArray);
        } else {
          setExpiringProducts([]);
        }

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
    fetchDashboardData();
    
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

  // Función para cargar productos con bajo stock cuando cambia el umbral
  const loadLowStockProducts = useCallback(async () => {
    try {
      // Obtener productos con bajo stock
      const { data: productosStock, error: productosStockError } = await supabase
        .from('productos')
        .select('*')
        .eq('uid', uid)
        .lt('stock', stockThreshold)
        .order('stock', { ascending: true });
      
      if (productosStockError) {
        console.error('Error al cargar productos con bajo stock:', productosStockError);
      }
      
      if (productosStock && productosStock.length > 0) {
        const lowStockProductsArray: LowStockProduct[] = productosStock.map(producto => ({
          id: producto.id,
          nombre: producto.nombre || 'Producto sin nombre',
          stock: producto.stock || 0,
          precio_venta: producto.precio_venta || 0,
          categoria: producto.categoria || 'Sin categoría'
        }));
        setLowStockProducts(lowStockProductsArray);
      } else {
        setLowStockProducts([]);
      }
    } catch (error) {
      console.error('Error al cargar productos con bajo stock:', error);
    }
  }, [uid, stockThreshold, supabase]);

  useEffect(() => {
    loadLowStockProducts();
  }, [stockThreshold, loadLowStockProducts]);

  // Función para cargar productos menos vendidos
  const getBottomProducts = useCallback(async () => {
    try {
      setLoadingBottomProducts(true);
      
      // 1. Obtener todos los productos del inventario
      const { data: allProducts, error: productsError } = await supabase
        .from('productos')
        .select('*')
        .eq('uid', uid);
      
      if (productsError) {
        console.error('Error al cargar productos:', productsError);
        return;
      }
      
      // 2. Obtener ventas del período seleccionado
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const { data: ventasHoy, error: ventasError } = await supabase
        .from('ventas')
        .select('*, detalle_ventas(*)')
        .eq('uid', uid)
        .gte('fecha', startDate.toISOString())
        .lte('fecha', endDate.toISOString());
      
      if (ventasError) {
        console.error('Error al cargar ventas:', ventasError);
        return;
      }
      
      // 3. Crear un mapa de productos con sus ventas
      const productosVendidos: Record<string, {
        id: string;
        nombre: string;
        cantidad: number;
        total: number
      }> = {};
      
      // Inicializar todos los productos con ventas en cero
      if (allProducts && allProducts.length > 0) {
        allProducts.forEach(producto => {
          productosVendidos[producto.id] = {
            id: producto.id,
            nombre: producto.nombre || 'Producto sin nombre',
            cantidad: 0,
            total: 0
          };
        });
      }
      
      // Sumar cantidades y montos por producto
      if (ventasHoy && ventasHoy.length > 0) {
        ventasHoy.forEach(venta => {
          if (venta.detalle_ventas && venta.detalle_ventas.length > 0) {
            venta.detalle_ventas.forEach((detalle: any) => {
              const productoId = detalle.producto_id;
              
              if (productoId && productosVendidos[productoId]) {
                const cantidad = detalle.cantidad || 1;
                const precioUnitario = detalle.precio_unitario || 0;
                const totalProducto = precioUnitario * cantidad;
                
                productosVendidos[productoId].cantidad += cantidad;
                productosVendidos[productoId].total += totalProducto;
              }
            });
          }
        });
      }
      
      // 4. Convertir a array y ordenar por cantidad vendida (de menor a mayor)
      const productosArray = Object.values(productosVendidos)
        .sort((a, b) => a.cantidad - b.cantidad);
      
      // 5. Calcular el total de ventas para los porcentajes
      const totalVentasProductos = productosArray.reduce((sum, p) => sum + p.total, 0);
      
      // 6. Formatear los productos menos vendidos con porcentajes
      const bottomProductsArray: TopProduct[] = productosArray
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          total: p.total,
          porcentaje: totalVentasProductos > 0 
            ? Math.round((p.total / totalVentasProductos) * 100) 
            : 0
        }));
      
      setBottomProducts(bottomProductsArray);
    } catch (error) {
      console.error('Error al cargar productos menos vendidos:', error);
    } finally {
      setLoadingBottomProducts(false);
    }
  }, [uid, selectedDate, supabase]);

  // Efecto para cargar productos menos vendidos
  useEffect(() => {
    getBottomProducts();
  }, [selectedDate, getBottomProducts]);

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
            Estadísticas de ventas y productos
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button 
            onClick={() => {
              const now = new Date();
              const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              const localYesterday = new Date(yesterday.getTime() - (yesterday.getTimezoneOffset() * 60000));
              setSelectedDate(localYesterday.toISOString().split('T')[0]);
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Ayer
          </button>
          <button 
            onClick={() => {
              const now = new Date();
              const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
              setSelectedDate(localNow.toISOString().split('T')[0]);
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hoy
          </button>
          <input
            type="date"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
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
                  `$${salesStats.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
                  `$${salesStats.averageTicket.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
                  `$${salesStats.saldoCaja.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
                  `$${salesStats.totalProfit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

      {/* Payment Methods Amounts */}
      <div className="mb-4 sm:mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingresos por Método de Pago</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow animate-pulse">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            paymentMethodAmounts.map((method) => (
              <div key={method.method} className={`${method.bgColor} ${method.textColor} p-4 rounded-lg flex items-center`}>
                <div className="mr-4">{method.icon}</div>
                <div>
                  <p className="text-sm font-medium">{method.method}</p>
                  <p className="text-xl font-bold">
                    {method.amount.toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pedidos a Proveedores Pendientes */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pedidos a Proveedores Pendientes</h2>
          <a href={`/${uid}/proveedores`} className="text-sm text-indigo-600 hover:text-indigo-800">
            Ver todos
          </a>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-center">
              <BanknotesIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">No hay pedidos pendientes</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Pedido
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega Estimada
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {order.proveedor_nombre}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {order.fecha_pedido}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {order.fecha_entrega_estimada}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.estado === 'pendiente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.estado === 'pendiente' ? 'Pendiente' : 'En curso'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Productos Más Vendidos</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-center">
              <ShoppingCartIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">No hay datos de productos vendidos</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Ventas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.nombre}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.cantidad}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${product.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{product.porcentaje}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${product.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos Menos Vendidos */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Productos Menos Vendidos</h2>
        
        {isLoading || loadingBottomProducts ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : bottomProducts.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-center">
              <ShoppingCartIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">No hay datos de productos</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Ventas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bottomProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.nombre}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.cantidad === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sin ventas
                        </span>
                      ) : (
                        product.cantidad
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${product.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{product.porcentaje}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-red-400 h-2.5 rounded-full" 
                            style={{ width: `${product.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos con Bajo Stock */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Productos con Bajo Stock</h2>
          <div className="mt-2 sm:mt-0 flex items-center">
            <label htmlFor="stockThreshold" className="mr-2 text-sm text-gray-700">
              Mostrar productos con menos de:
            </label>
            <input
              id="stockThreshold"
              type="number"
              min="1"
              max="100"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(parseInt(e.target.value) || 10)}
              className="w-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
            <span className="ml-2 text-sm text-gray-700">unidades</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : lowStockProducts.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-center">
              <ShoppingCartIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">No hay productos con menos de {stockThreshold} unidades en stock</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.nombre}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium" style={{ color: product.stock === 0 ? 'red' : product.stock < 5 ? 'orange' : 'inherit' }}>
                      {product.stock}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${product.precio_venta.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.categoria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos por Vencer */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Productos por Vencer</h2>
          <div className="mt-2 sm:mt-0 flex items-center">
            <label htmlFor="expirationDays" className="mr-2 text-sm text-gray-700">
              Mostrar productos que vencen en los próximos:
            </label>
            <select
              id="expirationDays"
              value={expirationDays}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setExpirationDays(newValue);
                loadData(); // Recargar datos cuando cambie la selección
              }}
              className="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
            >
              {expirationOptions.map(option => (
                <option key={option} value={option}>{option} días</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : expiringProducts.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-center">
              <ClockIcon className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">No hay productos por vencer en las próximas {expirationDays} días</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código de Barras
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Vencimiento
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Restantes
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiringProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.nombre}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.codigo_barras}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(product.fecha_vencimiento).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      {product.dias_restantes <= 3 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {product.dias_restantes === 0 ? 'Vence hoy' : 
                           product.dias_restantes === 1 ? 'Vence mañana' : 
                           `${product.dias_restantes} días`}
                        </span>
                      ) : product.dias_restantes <= 7 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {product.dias_restantes} días
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.dias_restantes} días
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.categoria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
          <div className="h-64">
            {paymentMethods.length > 0 ? (
              <Pie data={pieData} options={options} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
          <div className="h-64">
            {dailySales.length > 0 ? (
              <Bar data={barData} options={options} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas</h3>
          <div className="h-64">
            {monthlySales.length > 0 ? (
              <Line data={lineData} options={options} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {isLoading ? 'Cargando datos...' : 'No hay datos disponibles'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
