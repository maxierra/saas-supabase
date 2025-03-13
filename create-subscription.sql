-- Insertar una suscripción de prueba para el usuario
INSERT INTO public.suscripciones (
    uid,
    estado,
    trial_start_date,
    trial_end_date,
    datos_facturacion,
    created_at,
    updated_at
) VALUES (
    '8beb64c8-6d6d-43b0-9fa2-2577ea727eea',  -- tu user ID
    'trial',                                  -- estado inicial
    CURRENT_TIMESTAMP,                        -- inicio del trial
    CURRENT_TIMESTAMP + INTERVAL '30 days',   -- fin del trial (30 días)
    '{}',                                     -- datos de facturación vacíos
    CURRENT_TIMESTAMP,                        -- created_at
    CURRENT_TIMESTAMP                         -- updated_at
);
