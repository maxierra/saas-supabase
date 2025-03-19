import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Verificar variables de entorno críticas
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Usar un token de acceso de prueba si no hay uno configurado
// Este es un token de prueba genérico, debes reemplazarlo con uno válido
const testAccessToken = 'TEST-1234567890123456-012345-abcdefghijklmnopqrstuvwxyz-123456789';

// Inicializar MercadoPago con un valor predeterminado para evitar errores
const mercadopago = new MercadoPagoConfig({ 
  accessToken: accessToken || testAccessToken
});
const preference = new Preference(mercadopago);

// Registrar información de depuración
console.log('Variables de entorno en create-preference-basic:', {
  MERCADOPAGO_ACCESS_TOKEN: accessToken ? 'Definido' : 'No definido',
  NEXT_PUBLIC_BASE_URL: baseUrl || 'No definido'
});

export async function POST(request: Request) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  console.log('Variables de entorno en create-preference-basic:', {
    MERCADOPAGO_ACCESS_TOKEN: accessToken ? `${accessToken.substring(0, 8)}...` : 'No definido',
    NEXT_PUBLIC_BASE_URL: baseUrl || 'No definido'
  });

  try {
    // Obtener datos de la solicitud
    const { plan, userEmail, subscriptionId, userId } = await request.json();
    
    // Validar datos
    if (!plan || !userEmail) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }
    
    // Registrar información de depuración
    console.log('Procesando solicitud de pago básico:', {
      plan,
      userEmail,
      subscriptionId: subscriptionId || 'No proporcionado',
      userId: userId || 'No proporcionado'
    });
    
    // Determinar precio según el plan
    let price: number;
    let title: string;
    
    if (plan === 'monthly') {
      price = 20000; // $20,000 ARS
      title = 'Suscripción Mensual';
    } else if (plan === 'annual') {
      price = 200000; // $200,000 ARS
      title = 'Suscripción Anual (2 meses gratis)';
    } else {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      );
    }
    
    // Usar la URL de la solicitud como fallback para baseUrl
    const requestUrl = request.headers.get('origin') || 'http://localhost:3000';
    const effectiveBaseUrl = baseUrl || requestUrl;
    
    console.log('Usando URL base:', effectiveBaseUrl);
    
    // Crear preferencia de pago según la API de MercadoPago
    const preferenceData = {
      body: {
        items: [
          {
            id: `subscription_${plan}_${Date.now()}`,
            title,
            unit_price: price,
            quantity: 1,
            currency_id: 'ARS',
          }
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${effectiveBaseUrl}/test-simple?status=success`,
          failure: `${effectiveBaseUrl}/test-simple?status=failure`,
          pending: `${effectiveBaseUrl}/test-simple?status=pending`,
        },
        auto_return: 'approved',
        external_reference: userId 
          ? `user_${userId}_${subscriptionId ? `subscription_${subscriptionId}` : ''}_${Date.now()}`
          : (subscriptionId 
              ? `subscription_${subscriptionId}_${Date.now()}`
              : `test-${Date.now()}`),
        notification_url: `${effectiveBaseUrl}/api/mercadopago/webhook`,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        statement_descriptor: "MAXIERRA SAAS"
      }
    };

    console.log('Enviando preferencia a MercadoPago (basic):', JSON.stringify(preferenceData, null, 2));
    
    // Crear preferencia en MercadoPago
    try {
      const response = await preference.create(preferenceData);
      console.log('Respuesta de MercadoPago (basic):', JSON.stringify(response, null, 2));
      
      // Devolver URL de pago
      return NextResponse.json({
        id: response.id,
        init_point: response.init_point 
      });
    } catch (mpError: any) {
      console.error('Error específico de MercadoPago (basic):', mpError);
      console.error('Detalles del error (basic):', mpError.message);
      if (mpError.cause) {
        console.error('Causa del error (basic):', mpError.cause);
      }
      throw mpError; // Re-lanzar para que sea capturado por el try/catch exterior
    }
  } catch (error: any) {
    console.error('Error creating payment preference (basic):', error);
    return NextResponse.json(
      { error: 'Error al crear preferencia de pago', details: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
