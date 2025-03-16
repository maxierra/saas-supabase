-- Función para actualizar la contraseña de un usuario (solo para administradores)
create or replace function update_user_password(email text, new_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verificar si el usuario que realiza la solicitud es un administrador
  if not exists (
    select 1
    from auth.users
    where auth.uid() = id
    and raw_user_meta_data->>'role' = 'admin'
  ) then
    raise exception 'No autorizado: Se requieren permisos de administrador';
  end if;

  -- Actualizar la contraseña del usuario
  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf'))
  where auth.users.email = update_user_password.email;

  if found then
    return json_build_object('success', true, 'message', 'Contraseña actualizada exitosamente');
  else
    return json_build_object('success', false, 'message', 'Usuario no encontrado');
  end if;
end;
$$;