-- Solución para el problema de permisos de administrador y estructura de datos

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

-- 2. Modificar las funciones para permitir acceso a administradores y asegurar la estructura correcta
DROP FUNCTION IF EXISTS public.get_subscription_details();
CREATE OR REPLACE FUNCTION public.get_subscription_details()
RETURNS TABLE (
    id uuid,
    uid uuid,
    estado text,
    trial_start_date timestamp with time zone,
    trial_end_date timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    payment_id text,
    user_email text,
    datos_facturacion jsonb
)
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
        s.created_at,
        s.updated_at,
        s.payment_id,
        u.email as user_email,
        s.datos_facturacion
    FROM 
        suscripciones s
        LEFT JOIN auth.users u ON s.uid = u.id
    WHERE
        -- Permitir acceso a administradores o al propio usuario
        public.is_admin() = true OR s.uid = auth.uid();
$$;

-- 3. Dar permisos para las funciones
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_details() TO authenticated;

-- 4. Comentarios para documentación
COMMENT ON FUNCTION public.is_admin() IS 'Función que verifica si el usuario actual es administrador';
COMMENT ON FUNCTION public.get_subscription_details() IS 'Función segura que reemplaza la vista subscription_details, con acceso para administradores';
