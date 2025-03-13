-- Crear vista materializada para suscripciones con usuarios
CREATE MATERIALIZED VIEW IF NOT EXISTS suscripciones_con_usuarios AS
SELECT 
    s.*,
    u.email,
    u.raw_user_meta_data->>'full_name' as nombre_completo,
    u.raw_user_meta_data->>'phone' as telefono
FROM 
    suscripciones s
    LEFT JOIN auth.users u ON s.uid = u.id;

-- Crear índices para mejorar el rendimiento
CREATE UNIQUE INDEX IF NOT EXISTS suscripciones_con_usuarios_id_idx ON suscripciones_con_usuarios (id);
CREATE INDEX IF NOT EXISTS suscripciones_con_usuarios_uid_idx ON suscripciones_con_usuarios (uid);
CREATE INDEX IF NOT EXISTS suscripciones_con_usuarios_estado_idx ON suscripciones_con_usuarios (estado);

-- Crear función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION public.refresh_suscripciones_con_usuarios()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY suscripciones_con_usuarios;
END;
$$;

-- Dar permisos
GRANT SELECT ON suscripciones_con_usuarios TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_suscripciones_con_usuarios() TO authenticated;
