// tests/api/_lib/errors.test.ts
import { describe, it, expect } from 'vitest';
import { AppError } from '@/app/api/_lib/errors';

describe('AppError', () => {
  it('crea error 401 con unauthorized()', () => {
    const err = AppError.unauthorized();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.name).toBe('AppError');
  });

  it('crea error 403 con forbidden()', () => {
    const err = AppError.forbidden('Sin acceso');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Sin acceso');
  });

  it('crea error 404 con resource name', () => {
    const err = AppError.notFound('Transacción');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('Transacción');
  });

  it('crea error 409 con conflict()', () => {
    const err = AppError.conflict('Email ya registrado');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('incluye details en validation()', () => {
    const details = { field: 'amount', issue: 'must be positive' };
    const err = AppError.validation('Datos inválidos', details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });

  it('badRequest incluye details opcionales', () => {
    const err = AppError.badRequest('Campo requerido', { field: 'name' });
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'name' });
  });
});
