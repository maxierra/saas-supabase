-- Solución para el problema de permisos de administrador

-- 1. Verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'is_admin' = 'true'
    );
$$;

-- 2. Modificar las funciones para permitir acceso a administradores
DROP FUNCTION IF EXISTS public.get_suscripciones_con_usuarios();
CREATE OR REPLACE FUNCTION public.get_suscripciones_con_usuarios()
RETURNS SETOF public.suscripcion_con_usuario
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
        LEFT JOIN auth.users u ON s.uid = u.id
    WHERE
        -- Permitir acceso a administradores o al propio usuario
        public.is_admin() = true OR s.uid = auth.uid();
$$;

DROP FUNCTION IF EXISTS public.get_subscription_details();
CREATE OR REPLACE FUNCTION public.get_subscription_details()
RETURNS SETOF public.subscription_detail
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
        LEFT JOIN auth.users u ON s.uid = u.id
    WHERE
        -- Permitir acceso a administradores o al propio usuario
        public.is_admin() = true OR s.uid = auth.uid();
$$;

-- 3. Dar permisos para las funciones
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suscripciones_con_usuarios() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_details() TO authenticated;

-- 4. Comentarios para documentación
COMMENT ON FUNCTION public.is_admin() IS 'Función que verifica si el usuario actual es administrador';
COMMENT ON FUNCTION public.get_suscripciones_con_usuarios() IS 'Función segura que reemplaza la vista suscripciones_con_usuarios, con acceso para administradores';
COMMENT ON FUNCTION public.get_subscription_details() IS 'Función segura que reemplaza la vista subscription_details, con acceso para administradores';
