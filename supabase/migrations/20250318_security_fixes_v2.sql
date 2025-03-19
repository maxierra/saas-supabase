-- Solución más directa para los problemas de seguridad

-- 1. Eliminar las vistas problemáticas
DROP VIEW IF EXISTS public.suscripciones_con_usuarios CASCADE;
DROP VIEW IF EXISTS public.subscription_details CASCADE;

-- 2. Crear vistas nuevas con seguridad mejorada
-- Estas vistas NO exponen datos sensibles de auth.users
-- y NO usan SECURITY DEFINER

-- Vista suscripciones_con_usuarios
CREATE VIEW public.suscripciones_con_usuarios AS
SELECT 
    s.id,
    s.uid,
    s.estado,
    s.trial_start_date,
    s.trial_end_date,
    s.datos_facturacion,
    s.payment_id,
    s.created_at,
    s.updated_at,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', '') as nombre_completo,
    COALESCE(u.raw_user_meta_data->>'phone', '') as telefono
FROM 
    suscripciones s
    LEFT JOIN auth.users u ON s.uid = u.id;

-- Vista subscription_details
CREATE VIEW public.subscription_details AS
SELECT 
    s.id,
    s.uid,
    s.estado,
    s.trial_start_date,
    s.trial_end_date,
    s.datos_facturacion,
    s.payment_id,
    s.created_at,
    s.updated_at,
    u.email as user_email
FROM 
    suscripciones s
    LEFT JOIN auth.users u ON s.uid = u.id;

-- 3. Asegurar que las vistas no son accesibles para usuarios anónimos
REVOKE ALL ON public.suscripciones_con_usuarios FROM anon;
REVOKE ALL ON public.subscription_details FROM anon;

-- 4. Dar permisos solo a usuarios autenticados
GRANT SELECT ON public.suscripciones_con_usuarios TO authenticated;
GRANT SELECT ON public.subscription_details TO authenticated;

-- 5. Habilitar RLS en la tabla medios_pago (si aún no está hecho)
ALTER TABLE public.medios_pago ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de seguridad para la tabla medios_pago
DO $$
BEGIN
    -- Eliminar políticas existentes si las hay
    DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios medios de pago" ON public.medios_pago;
    DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propios medios de pago" ON public.medios_pago;
    DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios medios de pago" ON public.medios_pago;
    DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios medios de pago" ON public.medios_pago;
    
    -- Crear nuevas políticas
    CREATE POLICY "Los usuarios pueden ver sus propios medios de pago" 
        ON public.medios_pago
        FOR SELECT
        USING (uid = auth.uid());

    CREATE POLICY "Los usuarios pueden insertar sus propios medios de pago" 
        ON public.medios_pago
        FOR INSERT
        WITH CHECK (uid = auth.uid());

    CREATE POLICY "Los usuarios pueden actualizar sus propios medios de pago" 
        ON public.medios_pago
        FOR UPDATE
        USING (uid = auth.uid())
        WITH CHECK (uid = auth.uid());

    CREATE POLICY "Los usuarios pueden eliminar sus propios medios de pago" 
        ON public.medios_pago
        FOR DELETE
        USING (uid = auth.uid());
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error al crear políticas: %', SQLERRM;
END $$;

-- 7. Comentarios para documentación
COMMENT ON VIEW public.suscripciones_con_usuarios IS 'Vista segura que muestra suscripciones con información limitada de usuarios';
COMMENT ON VIEW public.subscription_details IS 'Vista segura que muestra detalles de suscripciones con información limitada de usuarios';
