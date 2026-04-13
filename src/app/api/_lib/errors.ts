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
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
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
