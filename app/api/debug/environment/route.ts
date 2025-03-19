import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Recopilar información sobre variables de entorno relevantes
    // Ocultamos partes de las claves por seguridad
    const envInfo = {
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY 
        ? `${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.substring(0, 8)}...` 
        : 'No definido',
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN 
        ? `${process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 8)}...` 
        : 'No definido',
      MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID 
        ? `${process.env.MERCADOPAGO_CLIENT_ID.substring(0, 4)}...` 
        : 'No definido',
      MERCADOPAGO_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET 
        ? `${process.env.MERCADOPAGO_CLIENT_SECRET.substring(0, 4)}...` 
        : 'No definido',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'No definido',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'No definido',
      NODE_ENV: process.env.NODE_ENV || 'No definido',
    };

    // Información del servidor
    const serverInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    return NextResponse.json({
      env: envInfo,
      server: serverInfo,
    });
  } catch (error: any) {
    console.error('Error al obtener información del entorno:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener información del entorno', details: error.message },
      { status: 500 }
    );
  }
}
