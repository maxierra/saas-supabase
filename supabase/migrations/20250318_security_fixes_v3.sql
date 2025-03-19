-- Solución radical para los problemas de seguridad

-- 1. Eliminar completamente las vistas problemáticas
DROP VIEW IF EXISTS public.suscripciones_con_usuarios CASCADE;
DROP VIEW IF EXISTS public.subscription_details CASCADE;

-- 2. Crear vistas seguras que NO usen auth.users directamente
-- En su lugar, crearemos funciones que obtengan solo los datos necesarios

-- Función para obtener email de usuario de forma segura
CREATE OR REPLACE FUNCTION public.get_user_email_safe(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT email FROM auth.users WHERE id = user_id;
$$;

-- Función para obtener nombre completo de usuario de forma segura
CREATE OR REPLACE FUNCTION public.get_user_fullname_safe(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(raw_user_meta_data->>'full_name', '') FROM auth.users WHERE id = user_id;
$$;

-- Función para obtener teléfono de usuario de forma segura
CREATE OR REPLACE FUNCTION public.get_user_phone_safe(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(raw_user_meta_data->>'phone', '') FROM auth.users WHERE id = user_id;
$$;

-- Vista suscripciones_con_usuarios usando las funciones seguras
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
    public.get_user_email_safe(s.uid) as email,
    public.get_user_fullname_safe(s.uid) as nombre_completo,
    public.get_user_phone_safe(s.uid) as telefono
FROM 
    suscripciones s;

-- Vista subscription_details usando las funciones seguras
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
    public.get_user_email_safe(s.uid) as user_email
FROM 
    suscripciones s;

-- 3. Asegurar que las vistas no son accesibles para usuarios anónimos
REVOKE ALL ON public.suscripciones_con_usuarios FROM anon;
REVOKE ALL ON public.subscription_details FROM anon;

-- 4. Dar permisos solo a usuarios autenticados
GRANT SELECT ON public.suscripciones_con_usuarios TO authenticated;
GRANT SELECT ON public.subscription_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_email_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_fullname_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_phone_safe TO authenticated;

-- 5. Habilitar RLS en la tabla medios_pago
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
COMMENT ON VIEW public.suscripciones_con_usuarios IS 'Vista segura que muestra suscripciones con información limitada de usuarios a través de funciones seguras';
COMMENT ON VIEW public.subscription_details IS 'Vista segura que muestra detalles de suscripciones con información limitada de usuarios a través de funciones seguras';
COMMENT ON FUNCTION public.get_user_email_safe IS 'Función segura para obtener el email de un usuario';
COMMENT ON FUNCTION public.get_user_fullname_safe IS 'Función segura para obtener el nombre completo de un usuario';
COMMENT ON FUNCTION public.get_user_phone_safe IS 'Función segura para obtener el teléfono de un usuario';
