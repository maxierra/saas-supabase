import { supabase } from '../lib/supabase';

// Tipos para la gestión de suscripciones
export interface Subscription {
  id?: string;
  uid: string;
  estado: 'trial' | 'active' | 'inactive';
  trial_start_date: string;
  trial_end_date: string;
  datos_facturacion?: any;
  payment_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crea una nueva suscripción de prueba para un usuario recién registrado
 * @param userId ID del usuario en Supabase Auth
 * @returns Objeto con el resultado de la operación
 */
export async function createTrialSubscription(userId: string) {
  try {
    // Calcular fechas de inicio y fin del período de prueba (30 días)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 días de prueba

    // Datos de la suscripción
    const subscriptionData: Subscription = {
      uid: userId,
      estado: 'trial',
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
    };

    // Insertar en la tabla de suscripciones
    const { data, error } = await supabase
      .from('suscripciones')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error('Error al crear la suscripción de prueba:', error);
      return {
        success: false,
        message: 'Error al crear la suscripción de prueba',
        error
      };
    }

    return {
      success: true,
      message: 'Suscripción de prueba creada correctamente',
      subscription: data
    };
  } catch (error) {
    console.error('Error inesperado al crear la suscripción:', error);
    return {
      success: false,
      message: 'Error inesperado al crear la suscripción',
      error
    };
  }
}

/**
 * Verifica si un usuario tiene una suscripción activa o en período de prueba
 * @param userId ID del usuario en Supabase Auth
 * @returns Objeto con el resultado de la verificación
 */
export async function checkSubscriptionStatus(userId: string) {
  console.log('🔍 checkSubscriptionStatus - Verificando suscripción para:', userId);
  try {
    // Obtener la suscripción del usuario
    console.log('📝 checkSubscriptionStatus - Consultando tabla suscripciones');
    const { data, error } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('uid', userId)
      .single();

    if (error) {
      console.error('❌ checkSubscriptionStatus - Error al verificar la suscripción:', error);
      return {
        active: false,
        message: 'Error al verificar la suscripción',
        error
      };
    }
    
    console.log('💳 checkSubscriptionStatus - Datos obtenidos:', data);

    if (!data) {
      console.log('⚠️ checkSubscriptionStatus - No se encontró suscripción');
      return {
        active: false,
        message: 'No se encontró una suscripción para este usuario',
        subscription: null
      };
    }

    const subscription = data as Subscription;
    const now = new Date();
    const trialEndDate = new Date(subscription.trial_end_date);

    // Verificar si la suscripción está activa
    if (subscription.estado === 'active') {
      console.log('✅ checkSubscriptionStatus - Suscripción activa');
      return {
        active: true,
        message: 'Suscripción activa',
        subscription
      };
    }
    
    // Verificar si está en período de prueba y no ha expirado
    if (subscription.estado === 'trial' && trialEndDate > now) {
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log('✅ checkSubscriptionStatus - En período de prueba, días restantes:', daysLeft);
      return {
        active: true,
        message: 'En período de prueba',
        subscription,
        daysLeft
      };
    }

    // Si está en período de prueba pero ha expirado, actualizar a inactivo
    if (subscription.estado === 'trial' && trialEndDate <= now) {
      console.log('⚠️ checkSubscriptionStatus - Período de prueba expirado');
      // Actualizar el estado a inactivo
      const { error: updateError } = await supabase
        .from('suscripciones')
        .update({ estado: 'inactive', updated_at: now.toISOString() })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Error al actualizar el estado de la suscripción:', updateError);
      }

      return {
        active: false,
        message: 'El período de prueba ha expirado',
        subscription: { ...subscription, estado: 'inactive' }
      };
    }

    // Por defecto, si el estado es 'inactive'
    console.log('❌ checkSubscriptionStatus - Suscripción inactiva');
    return {
      active: false,
      message: 'La suscripción no está activa',
      subscription
    };
  } catch (error) {
    console.error('Error inesperado al verificar la suscripción:', error);
    return {
      active: false,
      message: 'Error inesperado al verificar la suscripción',
      error
    };
  }
}

/**
 * Actualiza el estado de una suscripción
 * @param subscriptionId ID de la suscripción
 * @param newStatus Nuevo estado de la suscripción
 * @param paymentData Datos de pago opcionales
 * @returns Objeto con el resultado de la operación
 */
export async function updateSubscriptionStatus(
  subscriptionId: string, 
  newStatus: 'trial' | 'active' | 'inactive',
  paymentData?: { payment_id?: string, datos_facturacion?: any }
) {
  try {
    const updateData: any = {
      estado: newStatus,
      updated_at: new Date().toISOString()
    };

    // Si se proporcionan datos de pago, incluirlos en la actualización
    if (paymentData) {
      if (paymentData.payment_id) {
        updateData.payment_id = paymentData.payment_id;
      }
      if (paymentData.datos_facturacion) {
        updateData.datos_facturacion = paymentData.datos_facturacion;
      }
    }

    // Actualizar la suscripción
    const { data, error } = await supabase
      .from('suscripciones')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar la suscripción:', error);
      return {
        success: false,
        message: 'Error al actualizar la suscripción',
        error
      };
    }

    return {
      success: true,
      message: 'Suscripción actualizada correctamente',
      subscription: data
    };
  } catch (error) {
    console.error('Error inesperado al actualizar la suscripción:', error);
    return {
      success: false,
      message: 'Error inesperado al actualizar la suscripción',
      error
    };
  }
}
