import { createClient } from '@supabase/supabase-js';

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Use environment variable
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use environment variable

// Verificar si las credenciales de Supabase están disponibles
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Credenciales de Supabase no disponibles en webhook utils', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Definido' : 'No definido',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? 'Definido' : 'No definido'
  });
}

// Inicializar Supabase
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciales de Supabase no configuradas');
}
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Procesa un pago de MercadoPago
 * @param payment Objeto de pago de MercadoPago
 * @returns Resultado del procesamiento
 */
export async function processPayment(payment: any) {
  try {
    console.log('Procesando pago:', JSON.stringify(payment, null, 2));
  
    // Extraer información relevante del pago
    const externalReference = payment.external_reference || '';
    console.log('Referencia externa:', externalReference);
  
    // Extraer userId y subscriptionId de la referencia externa
    let userId = null;
    let subscriptionId = null;
  
    if (externalReference.includes('user_')) {
      // Formato: user_[userId]_subscription_[subscriptionId]_[timestamp]
      const userIdMatch = externalReference.match(/user_([^_]+)/);
      if (userIdMatch && userIdMatch[1]) {
        userId = userIdMatch[1];
      }
      
      const subscriptionIdMatch = externalReference.match(/subscription_([^_]+)/);
      if (subscriptionIdMatch && subscriptionIdMatch[1]) {
        subscriptionId = subscriptionIdMatch[1];
      }
    } else if (externalReference.includes('subscription_')) {
      // Formato antiguo: subscription_[subscriptionId]_[timestamp]
      const subscriptionIdMatch = externalReference.match(/subscription_([^_]+)/);
      if (subscriptionIdMatch && subscriptionIdMatch[1]) {
        subscriptionId = subscriptionIdMatch[1];
      }
    } else {
      // Formato de prueba o desconocido
      subscriptionId = externalReference;
    }
  
    console.log('Datos extraídos de la referencia:', { userId, subscriptionId });
  
    const results = {
      userId,
      subscriptionId,
      updated: false,
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      transaction_amount: payment.transaction_amount,
      date_created: payment.date_created,
      date_approved: payment.date_approved,
      date_last_updated: payment.date_last_updated,
    };
  
    // Actualizar la suscripción en la base de datos
    if (!subscriptionId) {
      console.error('Error: No se proporcionó subscriptionId');
      return { ...results, error: 'No se proporcionó subscriptionId' };
    }

    // Verificar si la suscripción existe
    const { data: subscription, error: checkError } = await supabase
      .from('suscripciones')
      .select('id, uid')
      .eq('id', subscriptionId)
      .single();
      
      if (checkError) {
        console.error('Error al verificar tabla suscripciones:', checkError);
        return { ...results, error: checkError.message };
      }
      
      // Actualizar estado de la suscripción
      const { error: updateError } = await supabase
        .from('suscripciones')
        .update({ 
          updated_at: new Date().toISOString(),
          payment_status: payment.status === 'approved' ? 'paid' : payment.status,
          payment_id: payment.id,
          payment_data: payment
        })
        .eq('id', subscriptionId);
      
      if (updateError) {
        console.error('Error al actualizar suscripción:', updateError);
        return { ...results, error: updateError.message };
      }
      
      // Registrar el pago en la tabla pagos si existe
      try {
        const { data, error: insertError } = await supabase
          .from('pagos')
          .insert({
            subscription_id: subscriptionId,
            user_id: userId,
            payment_id: payment.id,
            status: payment.status,
            amount: payment.transaction_amount,
            payment_method: payment.payment_method_id,
            payment_type: payment.payment_type_id,
            created_at: new Date().toISOString(),
            payment_data: payment
          });
        
        if (insertError) {
          console.error('Error al registrar pago:', insertError);
          // No fallamos el proceso si no se puede registrar el pago
        } else {
          return { ...results, updated: true, data };
        }
      } catch (insertCatchError) {
        console.error('Error al intentar registrar pago:', insertCatchError);
        // No fallamos el proceso si no se puede registrar el pago
      }
      
      return { ...results, updated: true };
  } catch (error: any) {
    console.error('Error al procesar pago en la base de datos:', error);
    return { error: error.message };
  }
}
