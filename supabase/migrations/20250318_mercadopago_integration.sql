-- Crear tabla para almacenar los pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.suscripciones(id),
  payment_id VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE,
  external_reference VARCHAR,
  metadata JSONB
);

-- Agregar campos adicionales a la tabla de suscripciones
ALTER TABLE public.suscripciones
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_subscription_id ON public.pagos(subscription_id);
CREATE INDEX IF NOT EXISTS idx_pagos_payment_id ON public.pagos(payment_id);
CREATE INDEX IF NOT EXISTS idx_pagos_status ON public.pagos(status);

-- Permisos RLS para la tabla de pagos
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver solo sus propios pagos
CREATE POLICY pagos_select_policy ON public.pagos
    FOR SELECT
    USING (
        subscription_id IN (
            SELECT id FROM public.suscripciones WHERE uid = auth.uid()
        )
    );

-- Política para permitir a los administradores ver todos los pagos
CREATE POLICY pagos_select_admin_policy ON public.pagos
    FOR SELECT
    USING (
        (SELECT public.is_admin())
    );

-- Función para obtener los pagos de un usuario
CREATE OR REPLACE FUNCTION public.get_user_payments()
RETURNS TABLE (
    id UUID,
    subscription_id UUID,
    payment_id VARCHAR,
    status VARCHAR,
    amount DECIMAL(10,2),
    payment_method VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    payment_date TIMESTAMP WITH TIME ZONE,
    external_reference VARCHAR
)
LANGUAGE sql
SECURITY INVOKER
AS $$
    SELECT 
        p.id,
        p.subscription_id,
        p.payment_id,
        p.status,
        p.amount,
        p.payment_method,
        p.created_at,
        p.payment_date,
        p.external_reference
    FROM 
        public.pagos p
    JOIN 
        public.suscripciones s ON p.subscription_id = s.id
    WHERE 
        s.uid = auth.uid() OR (SELECT public.is_admin())
    ORDER BY 
        p.created_at DESC;
$$;
