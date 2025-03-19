import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Función para cargar variables de entorno desde .env.local si no están disponibles
function loadEnvFromFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      // Read file with UTF-8 encoding instead of UTF-16LE
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      const envVars = {};
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const value = trimmedLine.substring(equalIndex + 1).trim();
          envVars[key] = value;
          console.log(`Loaded environment variable ${key}: ${value.substring(0, Math.min(10, value.length))}...`);
        }
      }
      
      return envVars;
    }
  } catch (error) {
    console.error('Error loading environment variables from file:', error);
  }
  return {};
}

// Cargar variables de entorno desde archivo si es necesario
const envVars = loadEnvFromFile();

// Verificar variables de entorno críticas
// Usar directamente los valores del archivo .env.local
const accessToken = envVars.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN; 
const baseUrl = envVars.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Registrar información de depuración con valores reales para diagnóstico
console.log('Variables cargadas desde archivo:', Object.keys(envVars));
console.log('Variables de entorno en create-preference:', {
  MERCADOPAGO_ACCESS_TOKEN: accessToken ? 'Definido' : 'No definido',
  MERCADOPAGO_ACCESS_TOKEN_VALUE: accessToken ? accessToken.substring(0, 15) + '...' : 'No disponible',
  NEXT_PUBLIC_BASE_URL: baseUrl || 'No definido',
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'No definido',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? 'Definido' : 'No definido'
});

// Hardcodear valores de respaldo si todo lo demás falla
const fallbackAccessToken = 'APP_USR-8602225221014399-031818-092df423b51a3d0b238edc0a42ecfb77-1592499121';
const fallbackSupabaseUrl = 'https://crtgzjzzqrxyizraqpyk.supabase.co';
const fallbackSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDYwMDIsImV4cCI6MjA1NjkyMjAwMn0.zQu06oF4VbJ0P7I_jtAEdnjC_RUdosnpRsjvUvgBEJ0';

// Usar valores efectivos con fallbacks
const effectiveAccessToken = accessToken || fallbackAccessToken;
const effectiveSupabaseUrl = supabaseUrl || fallbackSupabaseUrl;
const effectiveSupabaseKey = supabaseKey || fallbackSupabaseKey;

// Configurar MercadoPago
if (!accessToken) {
  console.error('Error: MERCADOPAGO_ACCESS_TOKEN no está definido');
}

// Inicializar MercadoPago con el token de acceso
// Usar el token efectivo que incluye fallbacks
const mercadopago = new MercadoPagoConfig({ 
  accessToken: effectiveAccessToken
});
const preference = new Preference(mercadopago);

// Verificar si las credenciales de Supabase están disponibles
if (!effectiveSupabaseUrl || !effectiveSupabaseKey) {
  console.error('Error: Credenciales de Supabase no disponibles', {
    NEXT_PUBLIC_SUPABASE_URL: effectiveSupabaseUrl ? 'Definido' : 'No definido',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: effectiveSupabaseKey ? 'Definido' : 'No definido'
  });
}

// Inicializar Supabase con los valores efectivos que incluyen fallbacks
const supabase = createClient(effectiveSupabaseUrl, effectiveSupabaseKey);

export async function POST(request: Request) {
  try {
    // Obtener datos de la solicitud
    const { amount, subscriptionId, userEmail, userId } = await request.json();
    
    // Validar datos
    if (!amount || !userEmail) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }
    
    // Usar el monto fijo proporcionado
    const price = amount; // $100 ARS
    const title = 'Pago único';
    
    // Usar la URL de la solicitud como fallback para baseUrl
    const requestUrl = request.headers.get('origin') || 'http://localhost:3000';
    const effectiveBaseUrl = baseUrl || requestUrl;
    
    console.log('Usando URL base:', effectiveBaseUrl);
    
    // Crear preferencia de pago según la nueva API de MercadoPago
    const preferenceData = {
      body: {
        items: [
          {
            id: `subscription_payment_${Date.now()}`,
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
          success: `${effectiveBaseUrl}/subscription/success`,
          failure: `${effectiveBaseUrl}/subscription/failure`,
          pending: `${effectiveBaseUrl}/subscription/pending`,
        },
        auto_return: 'approved',
        external_reference: subscriptionId,
        notification_url: `${effectiveBaseUrl}/api/mercadopago/webhook`,
      }
    };

    console.log('Enviando preferencia a MercadoPago:', JSON.stringify(preferenceData, null, 2));
    
    // Crear preferencia en MercadoPago
    try {
      // Verificar si la tabla suscripciones existe y tiene el formato esperado
      let tablesError = null;
      
      if (supabase) {
        const { error: checkError } = await supabase
          .from('suscripciones')
          .select('id')
          .limit(1);
          
        tablesError = checkError;
        
        if (checkError) {
          console.error('Error al verificar tabla suscripciones:', checkError);
          // Si hay un error al acceder a la tabla, continuamos sin actualizar la suscripción
        }
      } else {
        console.log('Supabase no está disponible, omitiendo verificación de tabla');
      }
      
      const response = await preference.create(preferenceData);
      console.log('Respuesta de MercadoPago:', JSON.stringify(response, null, 2));
      
      // Actualizar estado de la suscripción solo si la tabla existe y supabase está disponible
      if (!tablesError && supabase) {
        try {
          const { error: updateError } = await supabase
            .from('suscripciones')
            .update({ 
              updated_at: new Date().toISOString(),
              payment_status: 'pending'
            })
            .eq('id', subscriptionId);
            
          if (updateError) {
            console.error('Error al actualizar suscripción:', updateError);
          }
        } catch (dbError) {
          console.error('Error en la operación de base de datos:', dbError);
          // Continuamos para devolver la URL de pago aunque falle la actualización
        }
      } else {
        console.log('Omitiendo actualización de suscripción: Supabase no disponible o tabla no existe');
      }
      
      // Devolver URL de pago
      return NextResponse.json({
        id: response.id,
        init_point: response.init_point 
      });
    } catch (mpError: any) {
      console.error('Error específico de MercadoPago:', mpError);
      console.error('Detalles del error:', mpError.message);
      if (mpError.cause) {
        console.error('Causa del error:', mpError.cause);
      }
      throw mpError; // Re-lanzar para que sea capturado por el try/catch exterior
    }
  } catch (error: any) {
    console.error('Error al crear preferencia de pago:', error);
    return NextResponse.json(
      { error: 'Error al crear preferencia de pago: ' + error.message },
      { status: 500 }
    );
  }
}
