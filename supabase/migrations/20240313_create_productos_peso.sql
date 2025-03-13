-- Crear la tabla productos_peso
CREATE TABLE IF NOT EXISTS productos_peso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uid UUID NOT NULL REFERENCES auth.users(id),
    codigo_producto TEXT NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio_compra_gramo DECIMAL(10,2) NOT NULL CHECK (precio_compra_gramo >= 0),
    precio_venta_gramo DECIMAL(10,2) NOT NULL CHECK (precio_venta_gramo >= 0),
    stock_gramos DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (stock_gramos >= 0),
    profit DECIMAL(10,2) GENERATED ALWAYS AS (precio_venta_gramo - precio_compra_gramo) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(uid, codigo_producto)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_peso_uid ON productos_peso(uid);
CREATE INDEX IF NOT EXISTS idx_productos_peso_codigo ON productos_peso(codigo_producto);

-- Habilitar Row Level Security
ALTER TABLE productos_peso ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Usuarios pueden ver sus propios productos_peso" ON productos_peso
    FOR SELECT
    TO authenticated
    USING (auth.uid() = uid);

CREATE POLICY "Usuarios pueden crear sus propios productos_peso" ON productos_peso
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uid);

CREATE POLICY "Usuarios pueden actualizar sus propios productos_peso" ON productos_peso
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = uid)
    WITH CHECK (auth.uid() = uid);

CREATE POLICY "Usuarios pueden eliminar sus propios productos_peso" ON productos_peso
    FOR DELETE
    TO authenticated
    USING (auth.uid() = uid);

-- Comentarios de la tabla y columnas
COMMENT ON TABLE productos_peso IS 'Tabla para gestionar productos vendidos por peso';
COMMENT ON COLUMN productos_peso.precio_compra_gramo IS 'Precio de compra por gramo';
COMMENT ON COLUMN productos_peso.precio_venta_gramo IS 'Precio de venta por gramo';
COMMENT ON COLUMN productos_peso.stock_gramos IS 'Stock disponible en gramos';
COMMENT ON COLUMN productos_peso.profit IS 'Ganancia por gramo (calculado automáticamente)';