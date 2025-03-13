-- Crear vista para suscripciones con información de usuario
CREATE OR REPLACE VIEW subscription_details AS
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

-- Dar permisos para la vista
GRANT SELECT ON subscription_details TO authenticated;
