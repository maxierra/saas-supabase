import { createBrowserClient } from '@supabase/ssr';

// Valores de las variables de entorno
const supabaseUrl = 'https://crtgzjzzqrxyizraqpyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDYwMDIsImV4cCI6MjA1NjkyMjAwMn0.zQu06oF4VbJ0P7I_jtAEdnjC_RUdosnpRsjvUvgBEJ0';

// Comprobación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente de Supabase con opciones adicionales
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-crtgzjzzqrxyizraqpyk-auth-token'
    }
  }
);