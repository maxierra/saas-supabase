import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  console.log('Solicitud de pago de depuración recibida');
  
  try {
    // Obtener datos de la solicitud
    const { title, price, email } = await request.json();
    
    console.log('Datos recibidos para pago de depuración:', { title, price, email });
    
    // Obtener variables de entorno
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    console.log('Variables de entorno para depuración:', {
      MERCADOPAGO_ACCESS_TOKEN: accessToken ? `${accessToken.substring(0, 8)}...` : 'No definido',
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: publicKey ? `${publicKey.substring(0, 8)}...` : 'No definido',
      NEXT_PUBLIC_BASE_URL: baseUrl || 'No definido'
    });
    
    // Determinar la URL base para redirecciones
    const effectiveBaseUrl = baseUrl || (
      request.headers.get('origin') || 
      'http://localhost:3000'
    );
    
    console.log('URL base efectiva:', effectiveBaseUrl);
    
    // Usar un token de acceso de prueba si no hay uno configurado
    // Este es un token de prueba genérico, debes reemplazarlo con uno válido
    const testAccessToken = 'TEST-1234567890123456-012345-abcdefghijklmnopqrstuvwxyz-123456789';
    const testPublicKey = 'TEST-12345678-9012-3456-7890-123456789012';
    
    // Inicializar MercadoPago
    const mercadopago = new MercadoPagoConfig({ 
      accessToken: accessToken || testAccessToken
    });
    const preference = new Preference(mercadopago);
    
    // Crear preferencia de pago
    const preferenceData = {
      body: {
        items: [
          {
            id: `debug_payment_${Date.now()}`,
            title: title || 'Pago de depuración',
            unit_price: price || 100,
            quantity: 1,
            currency_id: 'ARS',
          }
        ],
        payer: {
          email: email || 'test_user_debug@testuser.com',
        },
        back_urls: {
          success: `${effectiveBaseUrl}/debug-payment?status=success`,
          failure: `${effectiveBaseUrl}/debug-payment?status=failure`,
          pending: `${effectiveBaseUrl}/debug-payment?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `debug_test_${Date.now()}`,
        notification_url: `${effectiveBaseUrl}/api/mercadopago/webhook`,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        statement_descriptor: "DEBUG PAYMENT"
      }
    };
    
    console.log('Datos de preferencia a enviar:', JSON.stringify(preferenceData, null, 2));
    
    // Crear preferencia en MercadoPago
    const response = await preference.create(preferenceData);
    
    console.log('Respuesta de MercadoPago:', JSON.stringify(response, null, 2));
    
    // Devolver respuesta completa para depuración
    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      public_key: publicKey || testPublicKey,
      access_token_prefix: accessToken ? accessToken.substring(0, 8) : testAccessToken.substring(0, 8),
      base_url: effectiveBaseUrl,
      preference_data: preferenceData,
      response_data: response
    });
    
  } catch (error: any) {
    console.error('Error al crear preferencia de pago para depuración:', error);
    
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
