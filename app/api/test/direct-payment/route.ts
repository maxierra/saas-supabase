import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar MercadoPago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Usar un token de acceso de prueba si no hay uno configurado
const testAccessToken = 'TEST-3408617136683207-010717-cb86059d66c3f2a1c245a449bae521c5-2200833740';

// Inicializar MercadoPago con un valor predeterminado para evitar errores
const mercadopago = new MercadoPagoConfig({ 
  accessToken: accessToken || testAccessToken
});
const preference = new Preference(mercadopago);

export async function POST(request: Request) {
  console.log('Solicitud de pago directo recibida');
  
  try {
    // Obtener datos de la solicitud
    const { title, price, email } = await request.json();
    
    console.log('Datos recibidos para pago directo:', { title, price, email });
    
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: título y precio' },
        { status: 400 }
      );
    }
    
    // Determinar la URL base para redirecciones
    const effectiveBaseUrl = baseUrl || (
      request.headers.get('origin') || 
      'http://localhost:3000'
    );
    
    console.log('URL base efectiva:', effectiveBaseUrl);
    
    // Crear preferencia de pago según la API de MercadoPago
    const preferenceData = {
      body: {
        items: [
          {
            id: `direct_payment_${Date.now()}`,
            title,
            unit_price: price,
            quantity: 1,
            currency_id: 'ARS',
          }
        ],
        payer: {
          email: email || 'test_user_123456@testuser.com',
        },
        back_urls: {
          success: `${effectiveBaseUrl}/test-user-payment?status=success`,
          failure: `${effectiveBaseUrl}/test-user-payment?status=failure`,
          pending: `${effectiveBaseUrl}/test-user-payment?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `direct_test_${Date.now()}`,
        notification_url: `${effectiveBaseUrl}/api/mercadopago/webhook`,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        }
      }
    };
    
    console.log('Datos de preferencia a enviar:', JSON.stringify(preferenceData, null, 2));
    
    // Crear preferencia en MercadoPago
    const response = await preference.create(preferenceData);
    
    console.log('Respuesta de MercadoPago:', JSON.stringify(response, null, 2));
    
    // Devolver respuesta al cliente
    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
    
  } catch (error: any) {
    console.error('Error al crear preferencia de pago directo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al crear preferencia de pago', 
        details: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
