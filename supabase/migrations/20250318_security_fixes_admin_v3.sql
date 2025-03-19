-- Actualizar la función get_suscripciones_con_usuarios para mantener la estructura correcta

DROP FUNCTION IF EXISTS public.get_suscripciones_con_usuarios();
CREATE OR REPLACE FUNCTION public.get_suscripciones_con_usuarios()
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
    nombre_completo text,
    telefono text,
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
        COALESCE(u.raw_user_meta_data->>'full_name', '') as nombre_completo,
        COALESCE(u.raw_user_meta_data->>'phone', '') as telefono,
        s.datos_facturacion
    FROM 
        suscripciones s
        LEFT JOIN auth.users u ON s.uid = u.id
    WHERE
        -- Permitir acceso a administradores o al propio usuario
        public.is_admin() = true OR s.uid = auth.uid();
$$;

-- Dar permisos para la función
GRANT EXECUTE ON FUNCTION public.get_suscripciones_con_usuarios() TO authenticated;

-- Comentarios para documentación
COMMENT ON FUNCTION public.get_suscripciones_con_usuarios() IS 'Función segura que reemplaza la vista suscripciones_con_usuarios, con acceso para administradores';
