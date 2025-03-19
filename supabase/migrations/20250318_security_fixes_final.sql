-- Solución FINAL para los problemas de seguridad
-- Reemplazar completamente las vistas por funciones

-- 1. Eliminar completamente las vistas problemáticas y funciones relacionadas
DROP VIEW IF EXISTS public.suscripciones_con_usuarios CASCADE;
DROP VIEW IF EXISTS public.subscription_details CASCADE;
DROP FUNCTION IF EXISTS public.get_user_email_safe(uuid);
DROP FUNCTION IF EXISTS public.get_user_fullname_safe(uuid);
DROP FUNCTION IF EXISTS public.get_user_phone_safe(uuid);
DROP FUNCTION IF EXISTS public.refresh_suscripciones_con_usuarios();
DROP FUNCTION IF EXISTS public.get_suscripciones_con_usuarios();
DROP FUNCTION IF EXISTS public.get_subscription_details();
DROP TYPE IF EXISTS public.suscripcion_con_usuario;
DROP TYPE IF EXISTS public.subscription_detail;

-- 2. Crear tipos para que las funciones sean más fáciles de usar
CREATE TYPE public.suscripcion_con_usuario AS (
    id uuid,
    uid uuid,
    estado text,
    trial_start_date timestamp with time zone,
    trial_end_date timestamp with time zone,
    datos_facturacion jsonb,
    payment_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text,
    nombre_completo text,
    telefono text
);

CREATE TYPE public.subscription_detail AS (
    id uuid,
    uid uuid,
    estado text,
    trial_start_date timestamp with time zone,
    trial_end_date timestamp with time zone,
    datos_facturacion jsonb,
    payment_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    user_email text
);

-- 3. Crear funciones que reemplacen las vistas
-- Estas funciones devuelven SETOF para simular el comportamiento de una vista
-- pero con mejor control de seguridad

-- Función que reemplaza a suscripciones_con_usuarios
CREATE OR REPLACE FUNCTION public.get_suscripciones_con_usuarios()
RETURNS SETOF public.suscripcion_con_usuario
LANGUAGE sql
SECURITY INVOKER
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
        s.uid = auth.uid() OR 
        (SELECT rolname FROM pg_roles WHERE oid = current_user::regrole::oid) = 'service_role';
$$;

-- Función que reemplaza a subscription_details
CREATE OR REPLACE FUNCTION public.get_subscription_details()
RETURNS SETOF public.subscription_detail
LANGUAGE sql
SECURITY INVOKER
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
        s.uid = auth.uid() OR 
        (SELECT rolname FROM pg_roles WHERE oid = current_user::regrole::oid) = 'service_role';
$$;

-- 4. Dar permisos solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_suscripciones_con_usuarios() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_details() TO authenticated;

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
COMMENT ON FUNCTION public.get_suscripciones_con_usuarios() IS 'Función segura que reemplaza la vista suscripciones_con_usuarios, con filtrado por usuario actual';
COMMENT ON FUNCTION public.get_subscription_details() IS 'Función segura que reemplaza la vista subscription_details, con filtrado por usuario actual';
COMMENT ON TYPE public.suscripcion_con_usuario IS 'Tipo para la función get_suscripciones_con_usuarios';
COMMENT ON TYPE public.subscription_detail IS 'Tipo para la función get_subscription_details';
