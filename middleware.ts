import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Credenciales de Supabase
const supabaseUrl = 'https://crtgzjzzqrxyizraqpyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDYwMDIsImV4cCI6MjA1NjkyMjAwMn0.zQu06oF4VbJ0P7I_jtAEdnjC_RUdosnpRsjvUvgBEJ0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydGd6anp6cXJ4eWl6cmFxcHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTM0NjAwMiwiZXhwIjoyMDU2OTIyMDAyfQ.22ZOF3U4NQ6cdbDTNFi367OG7oi7ocumixatwLICF10';

// Cliente de Supabase con rol de servicio
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/reset-password', '/subscription', '/admin/login'];

// Rutas protegidas que requieren verificación de suscripción
const protectedPaths = ['dashboard', 'productos', 'ventas', 'reportes', 'caja'];

// Verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  // La ruta /admin/login es pública
  if (pathname === '/admin/login') {
    return true;
  }

  // Rutas públicas explícitas
  if (publicRoutes.some(route => pathname === route)) {
    return true;
  }

  // Recursos estáticos y API
  const staticPaths = ['/_next/', '/favicon.ico', '/api/', '.js', '.css', '.png', '.jpg', '.svg'];
  if (staticPaths.some(path => pathname.includes(path))) {
    return true;
  }

  // La raíz '/' también es pública
  if (pathname === '/') {
    return true;
  }

  return false;
}

// Verificar si una ruta requiere suscripción
function isProtectedRoute(pathname: string): boolean {
  // Normalizar el pathname
  const normalizedPath = pathname.toLowerCase();

  // Si es una ruta pública, no está protegida
  if (isPublicRoute(normalizedPath)) {
    return false;
  }

  // Verificar rutas dinámicas con UID
  const uidPattern = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  if (uidPattern.test(normalizedPath)) {
    return true;
  }

  // Verificar otras rutas protegidas
  return protectedPaths.some(path => normalizedPath.includes(`/${path}`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware - Verificando ruta:', pathname);

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    console.log('Middleware - Ruta pública, acceso permitido');
    return NextResponse.next();
  }

  try {
    // Crear respuesta base
    const response = NextResponse.next();

    // Crear cliente de Supabase
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // No intentar parsear el valor como JSON si es base64
            if (name.includes('sb-') && value.startsWith('base64-')) {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 // 7 días
              });
            } else {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 // 7 días
              });
            }
          },
          remove(name: string, options: any) {
            response.cookies.set(name, '', { ...options, maxAge: 0, path: '/' });
          },
        },
      }
    );

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();

    // Manejar rutas administrativas
    if (pathname.startsWith('/admin')) {
      // Permitir acceso a /admin/login sin verificación de sesión
      if (pathname === '/admin/login') {
        // Si ya está autenticado como admin, redirigir al panel
        if (session?.user?.email === 'admin@admin.com' || 
            session?.user?.email === 'maxi.erramouspe77@gmail.com' ||
            session?.user?.user_metadata?.is_admin === 'true') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return response;
      }

      // Para otras rutas de admin, verificar si está autenticado
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Verificar si es administrador
      const isAdmin = 
        session.user.email === 'admin@admin.com' || 
        session.user.email === 'maxi.erramouspe77@gmail.com' || 
        session.user.user_metadata?.is_admin === 'true';
      
      // Permitir acceso solo a administradores
      if (!isAdmin) {
        console.log('Middleware - Usuario no es administrador');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      console.log('Middleware - Usuario es administrador, acceso permitido');
      return response;
    }

    // Para rutas no administrativas, verificar sesión
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si es una ruta protegida, verificar suscripción
    if (isProtectedRoute(pathname)) {
      // Obtener suscripción del usuario
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('suscripciones')
        .select('estado')
        .eq('uid', session.user.id)
        .single();

      // Verificar estado de suscripción
      if (subError || !subscription) {
        console.log('Middleware - Error o suscripción no encontrada');
        return NextResponse.redirect(new URL('/subscription?new=true', request.url));
      }

      console.log('Middleware - Estado de suscripción:', subscription.estado);
      
      // Permitir acceso si es trial o active
      if (subscription.estado === 'trial' || subscription.estado === 'active') {
        console.log('Middleware - Suscripción válida, acceso permitido');
        return response;
      }

      // Si es inactive, redirigir a suscripción
      console.log('Middleware - Suscripción inactiva, redirigiendo');
      return NextResponse.redirect(new URL('/subscription?expired=true', request.url));
    }

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Incluir todas las rutas excepto recursos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
