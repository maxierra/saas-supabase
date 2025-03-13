-- Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.get_subscription_users();

-- Recrear la función con los tipos correctos
CREATE OR REPLACE FUNCTION public.get_subscription_users()
RETURNS TABLE (
    user_id uuid,
    email varchar(255)  -- Cambiar a varchar(255) para coincidir con auth.users
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        u.id as user_id,
        u.email::varchar(255)  -- Asegurar el tipo correcto
    FROM auth.users u
    INNER JOIN suscripciones s ON s.uid = u.id;
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.get_subscription_users() TO authenticated;
