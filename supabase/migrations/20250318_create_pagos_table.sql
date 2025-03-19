-- Crear tabla para registrar pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  external_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Agregar índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS pagos_subscription_id_idx ON public.pagos (subscription_id);
CREATE INDEX IF NOT EXISTS pagos_payment_id_idx ON public.pagos (payment_id);
CREATE INDEX IF NOT EXISTS pagos_status_idx ON public.pagos (status);
CREATE INDEX IF NOT EXISTS pagos_payment_date_idx ON public.pagos (payment_date);

-- Configurar RLS para que solo los administradores y el usuario propietario puedan ver sus pagos
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los administradores ver todos los pagos
CREATE POLICY "Administradores pueden ver todos los pagos" 
  ON public.pagos 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE usuarios.uid = auth.uid() 
      AND usuarios.role = 'admin'
    )
  );

-- Política para permitir a los usuarios ver solo sus propios pagos
CREATE POLICY "Usuarios pueden ver sus propios pagos" 
  ON public.pagos 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.suscripciones 
      WHERE suscripciones.id = pagos.subscription_id 
      AND suscripciones.uid = auth.uid()
    )
  );

-- Política para permitir a la aplicación insertar pagos
CREATE POLICY "Servicio puede insertar pagos" 
  ON public.pagos 
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.pagos IS 'Tabla para registrar los pagos de suscripciones';
COMMENT ON COLUMN public.pagos.id IS 'Identificador único del registro de pago';
COMMENT ON COLUMN public.pagos.subscription_id IS 'ID de la suscripción asociada al pago';
COMMENT ON COLUMN public.pagos.payment_id IS 'ID del pago en MercadoPago';
COMMENT ON COLUMN public.pagos.status IS 'Estado del pago (approved, rejected, pending, etc.)';
COMMENT ON COLUMN public.pagos.amount IS 'Monto del pago';
COMMENT ON COLUMN public.pagos.payment_method IS 'Método de pago utilizado';
COMMENT ON COLUMN public.pagos.payment_date IS 'Fecha y hora del pago';
COMMENT ON COLUMN public.pagos.external_reference IS 'Referencia externa utilizada para identificar el pago';
COMMENT ON COLUMN public.pagos.metadata IS 'Datos adicionales del pago en formato JSON';
COMMENT ON COLUMN public.pagos.created_at IS 'Fecha y hora de creación del registro';
