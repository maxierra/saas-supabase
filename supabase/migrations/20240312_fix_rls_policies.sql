-- Habilitar RLS para la tabla suscripciones
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados de sus propias suscripciones
CREATE POLICY "Usuarios pueden ver sus propias suscripciones" ON suscripciones
    FOR SELECT
    TO authenticated
    USING (auth.uid() = uid);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Usuarios pueden crear sus propias suscripciones" ON suscripciones
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uid);

-- Política para permitir actualización a usuarios autenticados de sus propias suscripciones
CREATE POLICY "Usuarios pueden actualizar sus propias suscripciones" ON suscripciones
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = uid)
    WITH CHECK (auth.uid() = uid);

-- Política para permitir eliminación a usuarios autenticados de sus propias suscripciones
CREATE POLICY "Usuarios pueden eliminar sus propias suscripciones" ON suscripciones
    FOR DELETE
    TO authenticated
    USING (auth.uid() = uid);

-- Política para permitir acceso completo al rol service_role (para operaciones del servidor)
CREATE POLICY "Service role tiene acceso completo" ON suscripciones
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
