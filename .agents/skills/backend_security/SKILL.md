---
name: backend-security
version: 1.0.0
description: >
  Guía completa de seguridad para el backend de FinTrack: autenticación con
  NextAuth.js v5, autorización por rol y workspace, validación de inputs con Zod,
  rate limiting, headers de seguridad, protección CSRF y prevención de inyecciones.
  Úsalo siempre que trabajes con datos de usuarios, sesiones o acceso a BD.
tags:
  - security
  - auth
  - nextauth
  - zod
  - rate-limiting
  - backend
  - prisma
  - headers
stack:
  - NextAuth.js v5
  - Zod v3
  - Prisma 7
  - Next.js 16 Middleware
  - bcryptjs
depends-on:
  - backend-api-routes
author: FinTrack Dev Team
license: MIT
---

# Skill: Backend — Seguridad

Guía de seguridad para FinTrack Familia. **Nunca construyas un endpoint sin
pasar por esta lista.** La seguridad se aplica en capas: middleware global →
verificación de sesión → verificación de workspace → validación de datos.

---

## Cuándo usar este skill

- Al crear cualquier endpoint que acceda a datos del usuario
- Al implementar autenticación o registro
- Al diseñar la lógica de invitaciones y roles
- Al hacer deploy a producción

---

## Capa 1: Middleware Global (Next.js)

Protege todas las rutas del dashboard antes de que lleguen al componente.

```typescript
// middleware.ts (en la raíz del proyecto)
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Rutas públicas — siempre accesibles
  const publicRoutes = ['/login', '/register', '/invite', '/api/auth'];
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));

  // Sin sesión → redirigir a login
  if (!session && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión → agregar headers de seguridad
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
```

---

## Capa 2: Autenticación — NextAuth.js v5

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            memberships: {
              where: { workspace: { plan: { not: undefined } } },
              include: { workspace: true },
              orderBy: { joinedAt: 'desc' },
              take: 1,
            },
          },
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        const membership = user.memberships[0];

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name,
          image:       user.avatarUrl,
          workspaceId: membership?.workspaceId ?? null,
          role:        membership?.role ?? null,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.workspaceId = (user as any).workspaceId;
        token.role        = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id          = token.id as string;
      session.user.workspaceId = token.workspaceId as string | null;
      session.user.role        = token.role as string | null;
      return session;
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 días
});
```

### Tipos extendidos para NextAuth

```typescript
// types/next-auth.d.ts
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id:          string;
      workspaceId: string | null;
      role:        string | null;
    };
  }
}
```

---

## Capa 3: Autorización por Rol y Workspace

```typescript
// src/app/api/_lib/authorization.ts
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { AppError } from './errors';

type Permission =
  | 'canCreateExpense'
  | 'canCreateIncome'
  | 'canManageSubscriptions'
  | 'canManageBudgets'
  | 'canManageMembers';

// ✅ Verificar que el usuario tiene el permiso requerido en su workspace
export async function requirePermission(
  session: Session,
  permission: Permission,
): Promise<void> {
  if (!session.user.workspaceId) throw AppError.forbidden('No perteneces a ningún workspace');

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
      },
    },
  });

  if (!member) throw AppError.forbidden('No eres miembro de este workspace');
  if (!member[permission]) throw AppError.forbidden(`No tienes permiso para: ${permission}`);
}

// ✅ Verificar que un recurso pertenece al workspace del usuario
export async function requireSameWorkspace(
  resourceWorkspaceId: string,
  session: Session,
): Promise<void> {
  if (resourceWorkspaceId !== session.user.workspaceId) {
    throw AppError.forbidden('No tienes acceso a este recurso');
  }
}

// ✅ Solo OWNER o ADMIN pueden hacer esta acción
export function requireRole(session: Session, ...roles: string[]) {
  if (!session.user.role || !roles.includes(session.user.role)) {
    throw AppError.forbidden(`Requiere rol: ${roles.join(' o ')}`);
  }
}
```

**Uso en una API Route:**

```typescript
// src/app/api/subscriptions/route.ts
export const POST = withHandler(async (req) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  // Verifica permiso específico antes de proceder
  await requirePermission(session, 'canManageSubscriptions');

  // ... resto de la lógica
});
```

---

## Capa 4: Validación de Inputs con Zod

**Regla de oro: NUNCA confíes en el input del cliente. Siempre valida con Zod.**

```typescript
// ✅ PATRÓN CORRECTO — Validar siempre con Zod
import { z } from 'zod';

const CreateGoalSchema = z.object({
  name:         z.string().min(1).max(100).trim(),
  type:         z.enum(['EMERGENCY','VACATION','HOME','CAR','EDUCATION','INVESTMENT','TECH','WEDDING','BABY','CUSTOM']),
  targetAmount: z.number().positive().max(999_999_999),
  dueDate:      z.coerce.date().min(new Date()).optional(),  // No puede ser en el pasado
  priority:     z.enum(['LOW','MEDIUM','HIGH']).default('MEDIUM'),
  icon:         z.string().emoji().optional().default('🎯'),
  description:  z.string().max(500).trim().optional(),
  isShared:     z.boolean().default(true),
}).strict(); // ← .strict() rechaza cualquier campo extra no declarado

// ❌ INCORRECTO — Sin validación
export const POST = async (req: NextRequest) => {
  const body = await req.json(); // Cualquier cosa puede venir aquí
  await prisma.savingsGoal.create({ data: body }); // ¡PELIGROSO!
};

// ✅ CORRECTO — Con validación
export const POST = withHandler(async (req) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = CreateGoalSchema.parse(await req.json()); // Lanza ZodError si falla
  // body está 100% tipado y validado aquí
});

// Sanitizar strings para prevenir XSS
const SanitizedString = z.string()
  .trim()
  .transform(s => s.replace(/<[^>]*>/g, '')) // Strip HTML tags
  .pipe(z.string().min(1));
```

---

## Capa 5: Hash de Contraseñas

```typescript
// src/lib/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Mínimo 12 en producción

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Validación de fortaleza de contraseña
export const PasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial');
```

---

## Capa 6: Rate Limiting

```typescript
// src/lib/rate-limit.ts
// Solución in-memory para desarrollo / Edge compatible para producción
// En producción usar @upstash/ratelimit con Redis

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export async function rateLimit(
  identifier: string,
  { limit = 60, windowMs = 60_000 }: Partial<RateLimitConfig> = {},
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Uso en una route (ej: auth/register — máximo 5 por hora)
export const POST = withHandler(async (req) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, remaining, resetAt } = await rateLimit(`register:${ip}`, {
    limit: 5, windowMs: 60 * 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos, espera un momento', code: 'RATE_LIMIT' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }
  // ...
});
```

---

## Capa 7: Headers de Seguridad en next.config.ts

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval necesario para Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

---

## Capa 8: Protección de Variables de Entorno

```typescript
// src/lib/env.ts — Validar env vars al arrancar
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL:    z.string().url(),
  AUTH_SECRET:     z.string().min(32),
  AUTH_URL:        z.string().url(),
  NODE_ENV:        z.enum(['development', 'test', 'production']).default('development'),

  // Opcionales pero tipadas
  RESEND_API_KEY:  z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1); // Fallar rápido — mejor que un error en runtime
}

export const env = parsed.data;
```

---

## Reglas de Oro de Seguridad

```
🔴 NUNCA confiar en el input del cliente — siempre validar con Zod
🔴 NUNCA exponer stack traces en producción
🔴 NUNCA almacenar contraseñas en texto plano — siempre bcrypt min 12 rounds
🔴 NUNCA usar el mismo token para dev y prod
🔴 NUNCA filtrar datos de otros workspaces
🟡 Siempre verificar workspaceId después de la sesión
🟡 Siempre usar .strict() en Zod para rechazar campos extra
🟡 Siempre hashear en el servidor, no en el cliente
🟡 Siempre usar HTTPS en producción (HSTS)
🟢 Aplicar rate limiting en endpoints de auth
🟢 Usar variables de entorno para todos los secrets
🟢 Revisar logs de errores sin exponer datos personales
```
