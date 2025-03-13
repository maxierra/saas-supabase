-- Agregar columnas para el período de pago
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS period_month INTEGER,
ADD COLUMN IF NOT EXISTS period_year INTEGER;

-- Actualizar registros existentes
UPDATE pagos
SET 
  period_month = EXTRACT(MONTH FROM payment_date::timestamp),
  period_year = EXTRACT(YEAR FROM payment_date::timestamp)
WHERE period_month IS NULL OR period_year IS NULL;

-- Agregar restricciones
ALTER TABLE pagos
ADD CONSTRAINT period_month_range CHECK (period_month BETWEEN 1 AND 12),
ADD CONSTRAINT period_year_range CHECK (period_year >= 2024);

-- Agregar índice para mejorar el rendimiento de las consultas por período
CREATE INDEX IF NOT EXISTS idx_pagos_period ON pagos (period_year, period_month);

-- Agregar política RLS para permitir insertar pagos solo a administradores
CREATE POLICY "Enable insert for authenticated users only" ON public.pagos
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
