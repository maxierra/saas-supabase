-- Agregar campo venta_id a la tabla movimientos_caja
ALTER TABLE movimientos_caja
ADD COLUMN IF NOT EXISTS venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de consultas por venta_id
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_venta_id ON movimientos_caja(venta_id);

-- Comentario para la columna
COMMENT ON COLUMN movimientos_caja.venta_id IS 'ID de la venta asociada al movimiento de caja, si corresponde';

-- Asegurar que saldo_anterior tenga un valor por defecto
ALTER TABLE movimientos_caja 
ALTER COLUMN saldo_anterior SET DEFAULT 0;
