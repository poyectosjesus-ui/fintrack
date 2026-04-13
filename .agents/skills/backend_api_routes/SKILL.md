---
name: backend-api-routes
version: 1.0.0
description: >
  Patrones de producción para API Routes en Next.js 16 App Router con TypeScript
  estricto, validación Zod, manejo de errores estructurado, logging y respuestas
  tipadas. Compatible con el frontend React/SWR. Úsalo al crear o modificar
  cualquier endpoint en src/app/api/.
tags:
  - nextjs
  - api
  - backend
  - typescript
  - zod
  - rest
  - error-handling
  - prisma
stack:
  - Next.js 16 (App Router)
  - TypeScript 5+ strict
  - Prisma 7 + @prisma/adapter-pg
  - Zod v3
  - NextAuth.js v5
author: FinTrack Dev Team
license: MIT
---

# Skill: Backend — API Routes Next.js

Guía para crear API routes robustas, tipadas y sin errores en Next.js 16 App Router.
Cada route debe seguir esta estructura: **autenticar → validar → ejecutar → responder**.

---

## Cuándo usar este skill

- Al crear un nuevo endpoint en `src/app/api/`
- Al refactorizar una route existente
- Al agregar validación a una API
- Cuando el agente necesite seguir el patrón estándar de esta base de código

---

## 1. Estructura Base de una API Route

```
src/app/api/
├── transactions/
│   ├── route.ts          # GET (list) + POST (create)
│   └── [id]/
│       └── route.ts      # GET + PUT + DELETE (by id)
├── subscriptions/
│   ├── route.ts
│   └── [id]/route.ts
├── analytics/
│   └── route.ts          # Solo GET (read-only)
└── _lib/                 # Helpers internos de la API
    ├── responses.ts      # Helpers de respuesta estándar
    ├── errors.ts         # Clase AppError y códigos de error
    └── middleware.ts     # withAuth, withValidation wrappers
```

---

## 2. Tipos de Respuesta Estándar

Todas las API de este proyecto devuelven el mismo formato JSON.

```typescript
// src/app/api/_lib/responses.ts
import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ✅ Respuestas tipadas y consistentes
export const ok = <T>(data: T, meta?: ApiResponse['meta']) =>
  NextResponse.json<ApiResponse<T>>({ success: true, data, meta }, { status: 200 });

export const created = <T>(data: T) =>
  NextResponse.json<ApiResponse<T>>({ success: true, data }, { status: 201 });

export const noContent = () =>
  new NextResponse(null, { status: 204 });

export const badRequest = (message: string, code = 'BAD_REQUEST') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code }, { status: 400 });

export const unauthorized = (message = 'No autorizado') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'UNAUTHORIZED' }, { status: 401 });

export const forbidden = (message = 'Acceso denegado') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'FORBIDDEN' }, { status: 403 });

export const notFound = (resource = 'Recurso') =>
  NextResponse.json<ApiResponse>({ success: false, error: `${resource} no encontrado`, code: 'NOT_FOUND' }, { status: 404 });

export const conflict = (message: string) =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'CONFLICT' }, { status: 409 });

export const serverError = (message = 'Error interno del servidor') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
```

---

## 3. Clase AppError

```typescript
// src/app/api/_lib/errors.ts
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static unauthorized(msg = 'No autorizado') {
    return new AppError('UNAUTHORIZED', msg, 401);
  }
  static forbidden(msg = 'Acceso denegado') {
    return new AppError('FORBIDDEN', msg, 403);
  }
  static notFound(resource = 'Recurso') {
    return new AppError('NOT_FOUND', `${resource} no encontrado`, 404);
  }
  static conflict(msg: string) {
    return new AppError('CONFLICT', msg, 409);
  }
  static badRequest(msg: string, details?: unknown) {
    return new AppError('BAD_REQUEST', msg, 400, details);
  }
  static validation(msg: string, details: unknown) {
    return new AppError('VALIDATION_ERROR', msg, 400, details);
  }
}
```

---

## 4. Handler con try-catch Centralizado

```typescript
// src/app/api/_lib/handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { serverError } from './responses';
import { logger } from '@/lib/logger';

type RouteHandler = (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<NextResponse>;

// ✅ Wrapper que captura todos los errores automáticamente
export function withHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      // Error de validación Zod
      if (error instanceof ZodError) {
        return NextResponse.json(
          { success: false, error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.flatten() },
          { status: 400 },
        );
      }

      // Error de la aplicación (controlado)
      if (error instanceof AppError) {
        logger.warn({ code: error.code, message: error.message, details: error.details });
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, details: error.details },
          { status: error.statusCode },
        );
      }

      // Error de Prisma — clave única violada
      if ((error as any)?.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'El registro ya existe', code: 'CONFLICT' },
          { status: 409 },
        );
      }

      // Error de Prisma — registro no encontrado
      if ((error as any)?.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Registro no encontrado', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }

      // Error desconocido — loguear siempre
      logger.error({ error, path: req.nextUrl.pathname });
      return serverError();
    }
  };
}
```

---

## 5. Plantilla de Route — Lista + Creación

```typescript
// src/app/api/transactions/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created, unauthorized, badRequest } from '../_lib/responses';
import { AppError } from '../_lib/errors';

// ── Schemas de validación ──────────────────────────────────────────────────
const CreateTransactionSchema = z.object({
  type:            z.enum(['INCOME', 'EXPENSE']),
  amount:          z.number().positive('El monto debe ser positivo'),
  description:     z.string().min(1, 'La descripción es requerida').max(200),
  categoryId:      z.string().cuid('categoryId inválido'),
  paymentMethodId: z.string().cuid().optional(),
  currency:        z.string().length(3).default('MXN'),
  date:            z.coerce.date().optional(),
  tags:            z.array(z.string().max(30)).max(10).default([]),
  notes:           z.string().max(500).optional(),
});

const ListTransactionsSchema = z.object({
  type:       z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().cuid().optional(),
  from:       z.coerce.date().optional(),
  to:         z.coerce.date().optional(),
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
});

// ── GET /api/transactions ──────────────────────────────────────────────────
export const GET = withHandler(async (req) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const params = ListTransactionsSchema.parse(
    Object.fromEntries(req.nextUrl.searchParams),
  );

  const where = {
    workspaceId: session.user.workspaceId!,
    ...(params.type && { type: params.type }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.from || params.to) && {
      date: {
        ...(params.from && { gte: params.from }),
        ...(params.to && { lte: params.to }),
      },
    },
  };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true, paymentMethod: true, createdBy: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { date: 'desc' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
  ]);

  return ok(transactions, { total, page: params.page, limit: params.limit });
});

// ── POST /api/transactions ─────────────────────────────────────────────────
export const POST = withHandler(async (req) => {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!session.user.workspaceId) throw AppError.badRequest('Debes pertenecer a un workspace');

  const body = CreateTransactionSchema.parse(await req.json());

  // Verificar que la categoría pertenece al workspace o es del sistema
  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, OR: [{ scope: 'SYSTEM' }, { workspaceId: session.user.workspaceId }] },
  });
  if (!category) throw AppError.notFound('Categoría');

  const transaction = await prisma.transaction.create({
    data: {
      ...body,
      date:        body.date ?? new Date(),
      workspaceId: session.user.workspaceId,
      createdById: session.user.id,
      status:      'CONFIRMED',
    },
    include: { category: true, paymentMethod: true },
  });

  return created(transaction);
});
```

---

## 6. Plantilla de Route — Por ID

```typescript
// src/app/api/transactions/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, noContent, unauthorized } from '../../_lib/responses';
import { AppError } from '../../_lib/errors';

type Ctx = { params: { id: string } };

const UpdateSchema = z.object({
  amount:          z.number().positive().optional(),
  description:     z.string().min(1).max(200).optional(),
  categoryId:      z.string().cuid().optional(),
  paymentMethodId: z.string().cuid().nullable().optional(),
  date:            z.coerce.date().optional(),
  tags:            z.array(z.string()).optional(),
  notes:           z.string().max(500).nullable().optional(),
}).strict(); // ← .strict() rechaza campos extra

// ── GET /api/transactions/:id ──────────────────────────────────────────────
export const GET = withHandler(async (_req, { params }) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const tx = await prisma.transaction.findFirst({
    where: { id: params.id, workspaceId: session.user.workspaceId! },
    include: { category: true, paymentMethod: true, splits: true, attachments: true },
  });
  if (!tx) throw AppError.notFound('Transacción');

  return ok(tx);
});

// ── PUT /api/transactions/:id ──────────────────────────────────────────────
export const PUT = withHandler(async (req, { params }) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = UpdateSchema.parse(await req.json());

  // Verificar ownership ANTES de editar
  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, workspaceId: session.user.workspaceId! },
  });
  if (!existing) throw AppError.notFound('Transacción');

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: body,
    include: { category: true },
  });

  return ok(updated);
});

// ── DELETE /api/transactions/:id ───────────────────────────────────────────
export const DELETE = withHandler(async (_req, { params }) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, workspaceId: session.user.workspaceId! },
  });
  if (!existing) throw AppError.notFound('Transacción');

  await prisma.transaction.delete({ where: { id: params.id } });
  return noContent();
});
```

---

## 7. Logger Estructurado

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message?: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, data: unknown) {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    ...(typeof data === 'string' ? { message: data } : (data as object)),
  };

  if (process.env.NODE_ENV === 'production') {
    // En producción: JSON estructurado (compatible con Datadog, CloudWatch, etc.)
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  } else {
    // En dev: legible
    const colors = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' };
    console[level === 'error' ? 'error' : 'log'](`${colors[level]}[${level.toUpperCase()}]\x1b[0m`, entry);
  }
}

export const logger = {
  debug: (data: unknown) => log('debug', data),
  info:  (data: unknown) => log('info', data),
  warn:  (data: unknown) => log('warn', data),
  error: (data: unknown) => log('error', data),
};
```

---

## Checklist al crear una Route

```
✅ Verifica sesión con auth() al inicio
✅ Valida el body con Zod (no parsear manualmente)
✅ Usa withHandler() para captura automática de errores
✅ Verifica que el recurso pertenece al workspaceId del usuario
✅ Devuelve siempre ApiResponse<T> con los helpers de responses.ts
✅ Usa transacciones Prisma ($transaction) cuando afectes >1 tabla
✅ Tiene índices en los campos filtrados (fecha, categoría, workspace)
✅ No expone stack traces en producción
✅ Tiene tests unitarios (ver skill backend-testing)
```
