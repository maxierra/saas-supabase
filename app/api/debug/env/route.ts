import { NextResponse } from 'next/server';

export async function GET() {
  // Recopilar información sobre las variables de entorno
  // Nota: No mostramos los valores completos por seguridad, solo si están definidos
  const envInfo = {
    supabase: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definido' : 'No definido',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definido' : 'No definido',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definido' : 'No definido',
    },
    mercadopago: {
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY 
        ? `Definido (${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.substring(0, 8)}...)` 
        : 'No definido',
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN 
        ? `Definido (${process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 8)}...)` 
        : 'No definido',
      MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID ? 'Definido' : 'No definido',
      MERCADOPAGO_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET ? 'Definido' : 'No definido',
    },
    app: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? 'Definido' : 'No definido',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Definido' : 'No definido',
      NODE_ENV: process.env.NODE_ENV,
    }
  };

  // También incluir información del servidor
  const serverInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
  };

  return NextResponse.json({
    envInfo,
    serverInfo,
    message: 'Esta información es solo para depuración. No incluye valores sensibles.'
  });
}
