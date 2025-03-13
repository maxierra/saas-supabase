-- Función para obtener usuarios con suscripciones
CREATE OR REPLACE FUNCTION public.get_subscription_users()
RETURNS TABLE (
    user_id uuid,
    email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        u.id as user_id,
        u.email
    FROM auth.users u
    INNER JOIN suscripciones s ON s.uid = u.id;
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.get_subscription_users() TO authenticated;
