// src/app/api/_lib/handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { serverError } from './responses';
import { logger } from '@/lib/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteCtx = { params: Promise<any> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, ctx: RouteCtx) => Promise<NextResponse<any>>;

/**
 * Wrapper que captura automáticamente todos los errores de una API route.
 * Orden de captura: ZodError → AppError → Prisma → Error genérico
 */
export function withHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      // Error de validación Zod
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos inválidos',
            code: 'VALIDATION_ERROR',
            details: error.flatten(),
          },
          { status: 400 },
        );
      }

      // Error controlado de la aplicación
      if (error instanceof AppError) {
        logger.warn({ code: error.code, message: error.message, details: error.details });
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
          },
          { status: error.statusCode },
        );
      }

      // Error de Prisma: clave única violada (P2002)
      if ((error as any)?.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'El registro ya existe', code: 'CONFLICT' },
          { status: 409 },
        );
      }

      // Error de Prisma: registro no encontrado (P2025)
      if ((error as any)?.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Registro no encontrado', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }

      // Error desconocido — logear todo el contexto
      logger.error({
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        path: req.nextUrl.pathname,
        method: req.method,
      });

      return serverError();
    }
  };
}
