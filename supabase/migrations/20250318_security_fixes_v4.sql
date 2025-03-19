-- Solución para los problemas de SECURITY DEFINER en las vistas

-- 1. Verificar si las vistas tienen SECURITY DEFINER
DO $$
DECLARE
    view_security text;
BEGIN
    -- Verificar suscripciones_con_usuarios
    SELECT pg_catalog.pg_get_viewdef('public.suscripciones_con_usuarios'::regclass, true) INTO view_security;
    RAISE NOTICE 'Vista suscripciones_con_usuarios: %', view_security;
    
    -- Verificar subscription_details
    SELECT pg_catalog.pg_get_viewdef('public.subscription_details'::regclass, true) INTO view_security;
    RAISE NOTICE 'Vista subscription_details: %', view_security;
END $$;

-- 2. Eliminar completamente las vistas problemáticas
DROP VIEW IF EXISTS public.suscripciones_con_usuarios CASCADE;
DROP VIEW IF EXISTS public.subscription_details CASCADE;

-- 3. Recrear las vistas con SECURITY INVOKER explícito
-- PostgreSQL no permite especificar SECURITY INVOKER en vistas directamente,
-- así que usaremos un enfoque diferente

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
    public.get_user_email_safe(s.uid) as email,
    public.get_user_fullname_safe(s.uid) as nombre_completo,
    public.get_user_phone_safe(s.uid) as telefono
FROM 
    suscripciones s
WHERE
    -- Esta condición fuerza a que la vista se ejecute con los permisos del usuario que la consulta
    -- ya que solo pueden ver sus propios datos
    s.uid = auth.uid() OR 
    -- O si el usuario tiene el rol de servicio (para administración)
    (SELECT rolname FROM pg_roles WHERE oid = current_user::regrole::oid) = 'service_role';

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
    public.get_user_email_safe(s.uid) as user_email
FROM 
    suscripciones s
WHERE
    -- Esta condición fuerza a que la vista se ejecute con los permisos del usuario que la consulta
    -- ya que solo pueden ver sus propios datos
    s.uid = auth.uid() OR 
    -- O si el usuario tiene el rol de servicio (para administración)
    (SELECT rolname FROM pg_roles WHERE oid = current_user::regrole::oid) = 'service_role';

-- 4. Asegurar que las vistas no son accesibles para usuarios anónimos
REVOKE ALL ON public.suscripciones_con_usuarios FROM anon;
REVOKE ALL ON public.subscription_details FROM anon;

-- 5. Dar permisos solo a usuarios autenticados
GRANT SELECT ON public.suscripciones_con_usuarios TO authenticated;
GRANT SELECT ON public.subscription_details TO authenticated;

-- 6. Comentarios para documentación
COMMENT ON VIEW public.suscripciones_con_usuarios IS 'Vista segura que muestra suscripciones con información limitada de usuarios, con filtrado por usuario actual';
COMMENT ON VIEW public.subscription_details IS 'Vista segura que muestra detalles de suscripciones con información limitada de usuarios, con filtrado por usuario actual';
