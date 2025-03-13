import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Crear cliente de Supabase con cookies del servidor
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('🔍 API - Verificando suscripción para usuario:', userId);
    
    const { data: subscription, error } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('uid', userId)
      .single();
      
    if (error) {
      console.error('❌ API - Error al obtener suscripción:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API - Suscripción encontrada:', subscription);
    return NextResponse.json({ subscription });
    
  } catch (error) {
    console.error('❌ API - Error general:', error);
    return NextResponse.json(
      { error: 'Error al verificar la suscripción' },
      { status: 500 }
    );
  }
}
