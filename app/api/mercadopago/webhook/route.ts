import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { processPayment } from './utils';

// Verificar variables de entorno
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!accessToken) {
  console.error('Error: MERCADOPAGO_ACCESS_TOKEN no está definido en webhook');
  throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
}

// Configurar MercadoPago
const mercadopago = new MercadoPagoConfig({ accessToken });
const paymentClient = new Payment(mercadopago);

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Webhook de MercadoPago recibido`);
  console.log(`[${requestId}] Headers:`, JSON.stringify(Object.fromEntries([...request.headers.entries()]), null, 2));
  
  try {
    // Obtener y validar datos de la solicitud
    const body = await request.text();
    if (!body) {
      console.error(`[${requestId}] Error: Cuerpo de la solicitud vacío`);
      return NextResponse.json({ error: 'Cuerpo de la solicitud vacío' }, { status: 400 });
    }
    console.log(`[${requestId}] Cuerpo de la solicitud:`, body);
    
    // Parsear y validar los datos
    const params = new URLSearchParams(body);
    const type = params.get('type');
    const id = params.get('id');

    if (!type || !id) {
      console.error(`[${requestId}] Error: Parámetros inválidos - type: ${type}, id: ${id}`);
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }
    
    console.log('Tipo de notificación:', type);
    console.log('ID:', id);
    
    // Verificar si es una notificación de pago
    if (type === 'payment' && id) {
      console.log('Obteniendo información del pago:', id);
      
      try {
        // Obtener detalles del pago desde MercadoPago
        const paymentResponse = await paymentClient.get({ id: Number(id) });
        console.log('Respuesta de MercadoPago:', JSON.stringify(paymentResponse, null, 2));
        
        if (paymentResponse) {
          // Procesar el pago
          const result = await processPayment(paymentResponse);
          console.log('Pago procesado:', JSON.stringify(result, null, 2));
          
          return NextResponse.json({ success: true, message: 'Pago procesado correctamente', result });
        } else {
          throw new Error(`Error al obtener detalles del pago`);
        }
      } catch (paymentError: any) {
        console.error('Error al obtener detalles del pago:', paymentError);
        return NextResponse.json(
          { error: 'Error al obtener detalles del pago', details: paymentError.message },
          { status: 500 }
        );
      }
    } else {
      // No es una notificación de pago o falta el ID
      console.log('No es una notificación de pago o falta el ID');
      return NextResponse.json({ success: true, message: 'Notificación recibida pero no procesada' });
    }
  } catch (error: any) {
    console.error('Error en webhook de MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error al procesar webhook', details: error.message },
      { status: 500 }
    );
  }
}
