import { NextResponse } from 'next/server';

// Importar el webhook handler para reutilizarlo
import { processPayment } from '../../mercadopago/webhook/utils';

export async function POST(request: Request) {
  try {
    // Obtener datos de la solicitud
    const { payment } = await request.json();
    
    if (!payment) {
      return NextResponse.json(
        { error: 'No se proporcionó un objeto de pago' },
        { status: 400 }
      );
    }
    
    console.log('Simulando pago con datos:', JSON.stringify(payment, null, 2));
    
    // Procesar el pago simulado
    const result = await processPayment(payment);
    
    return NextResponse.json({
      success: true,
      message: 'Pago simulado procesado correctamente',
      result
    });
  } catch (error: any) {
    console.error('Error al simular pago:', error);
    return NextResponse.json(
      { 
        error: 'Error al simular pago', 
        details: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
