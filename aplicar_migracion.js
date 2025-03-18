// Script para aplicar la migración a la base de datos de Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarMigracion() {
  try {
    // Leer el archivo de migración
    const migracionPath = path.join(__dirname, 'supabase', 'migrations', '20250318_update_movimientos_caja.sql');
    const sql = fs.readFileSync(migracionPath, 'utf8');

    console.log('Aplicando migración...');
    
    // Ejecutar la migración usando la API de Supabase
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migración aplicada con éxito');
  } catch (error) {
    console.error('Error al aplicar la migración:', error);
  }
}

aplicarMigracion();
