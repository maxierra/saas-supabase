-- Verificar si el usuario tiene el metadato is_admin
SELECT 
    id, 
    email, 
    raw_user_meta_data,
    raw_user_meta_data->>'is_admin' as is_admin
FROM 
    auth.users
WHERE 
    email = 'maxi.erramouspe77@gmail.com';

-- Verificar la función is_admin (ejecutar como el usuario específico)
SELECT public.is_admin();
