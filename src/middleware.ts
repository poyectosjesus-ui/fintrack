// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Prefijos de rutas completamente públicas
const PUBLIC_PREFIXES = ['/login', '/register', '/api/auth', '/invite'];

// Rutas de API públicas adicionales
const PUBLIC_API_ROUTES = ['/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    PUBLIC_API_ROUTES.includes(pathname);

  // Rutas de archivos estáticos — siempre permitir
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Sin sesión y ruta protegida → redirigir a login
  if (!session && !isPublic) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión → aplicar headers de seguridad
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
