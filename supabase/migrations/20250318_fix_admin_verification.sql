-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _is_admin boolean;
BEGIN
  -- Obtener el ID del usuario actual
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Verificar si el usuario tiene el rol de administrador en los metadatos
  SELECT 
    CASE 
      WHEN raw_user_meta_data->>'is_admin' = 'true' OR 
           email = 'admin@admin.com' OR 
           email = 'maxi.erramouspe77@gmail.com'
      THEN true
      ELSE false
    END INTO _is_admin
  FROM auth.users
  WHERE id = _user_id;

  RETURN COALESCE(_is_admin, false);
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;