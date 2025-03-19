-- Configurar usuario como administrador
-- Reemplaza 'TU_EMAIL@EJEMPLO.COM' con tu dirección de correo electrónico

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": "true"}'::jsonb
WHERE email = 'maxi.erramouspe77@gmail.com';

-- Verificar que el usuario ahora es administrador
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'maxi.erramouspe77@gmail.com';
