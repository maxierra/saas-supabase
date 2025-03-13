-- Función para asignar rol de administrador a un usuario
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar los metadatos del usuario para incluir el rol de admin
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'admin')
  WHERE id = user_id;
END;
$$;

-- Dar permisos para ejecutar la función solo a superadmins
REVOKE ALL ON FUNCTION public.set_user_as_admin FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO service_role;
