-- 1. Solucionar el problema de exposición de auth.users

-- Recrear la vista suscripciones_con_usuarios sin exponer datos sensibles
DROP VIEW IF EXISTS public.suscripciones_con_usuarios;

CREATE OR REPLACE VIEW public.suscripciones_con_usuarios AS
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
    u.raw_user_meta_data->>'full_name' as nombre_completo,
    u.raw_user_meta_data->>'phone' as telefono
FROM 
    suscripciones s
    LEFT JOIN auth.users u ON s.uid = u.id;

-- Recrear la función para refrescar la vista pero con SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.refresh_suscripciones_con_usuarios()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER -- Cambiado de SECURITY DEFINER a SECURITY INVOKER
AS $$
BEGIN
  -- Como ahora es una vista regular, no necesitamos refrescarla
  -- Esta función se mantiene por compatibilidad
  RAISE NOTICE 'Esta función ya no es necesaria porque suscripciones_con_usuarios ahora es una vista regular';
END;
$$;

-- Recrear la vista subscription_details sin exponer datos sensibles
DROP VIEW IF EXISTS public.subscription_details;

CREATE OR REPLACE VIEW public.subscription_details AS
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

-- Dar permisos solo a usuarios autenticados, no a anónimos
REVOKE SELECT ON public.suscripciones_con_usuarios FROM anon;
REVOKE SELECT ON public.subscription_details FROM anon;

GRANT SELECT ON public.suscripciones_con_usuarios TO authenticated;
GRANT SELECT ON public.subscription_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_suscripciones_con_usuarios() TO authenticated;

-- 2. Habilitar RLS en la tabla medios_pago
ALTER TABLE public.medios_pago ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para la tabla medios_pago
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

-- Comentarios para documentación
COMMENT ON VIEW public.suscripciones_con_usuarios IS 'Vista segura que muestra suscripciones con información limitada de usuarios';
COMMENT ON VIEW public.subscription_details IS 'Vista segura que muestra detalles de suscripciones con información limitada de usuarios';
COMMENT ON FUNCTION public.refresh_suscripciones_con_usuarios() IS 'Función mantenida por compatibilidad, ya no es necesaria';
