import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function GET() {
  try {
    // Obtener variables de entorno
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    // Verificar si las variables de entorno están configuradas
    const envStatus = {
      MERCADOPAGO_ACCESS_TOKEN: accessToken ? 'Configurado' : 'No configurado',
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: publicKey ? 'Configurado' : 'No configurado',
      MERCADOPAGO_CLIENT_ID: clientId ? 'Configurado' : 'No configurado',
      MERCADOPAGO_CLIENT_SECRET: clientSecret ? 'Configurado' : 'No configurado',
      NEXT_PUBLIC_BASE_URL: baseUrl ? 'Configurado' : 'No configurado',
    };
    
    // Verificar si el token de acceso es válido
    let tokenStatus = 'No verificado';
    let tokenError = null;
    
    if (accessToken) {
      try {
        // Inicializar MercadoPago con el token de acceso
        const mercadopago = new MercadoPagoConfig({ 
          accessToken: accessToken
        });
        const paymentClient = new Payment(mercadopago);
        
        // Intentar obtener un pago (cualquiera) para verificar si el token es válido
        // Usamos un ID que probablemente no exista, pero nos interesa solo verificar la autenticación
        await paymentClient.get({ id: 1 });
        
        // Si no hay error, el token es válido
        tokenStatus = 'Válido';
      } catch (error: any) {
        // Si el error es de autenticación, el token no es válido
        if (error.message && (
            error.message.includes('invalid access token') || 
            error.message.includes('unauthorized') ||
            error.message.includes('authentication')
        )) {
          tokenStatus = 'Inválido';
          tokenError = error.message;
        } else {
          // Si es otro tipo de error, el token podría ser válido pero hay otro problema
          tokenStatus = 'Error al verificar';
          tokenError = error.message;
        }
      }
    }
    
    return NextResponse.json({
      environment: envStatus,
      token: {
        status: tokenStatus,
        error: tokenError
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error al verificar credenciales:', error);
    
    return NextResponse.json(
      { error: 'Error al verificar credenciales', details: error.message },
      { status: 500 }
    );
  }
}
