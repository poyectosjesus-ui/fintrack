// src/app/api/_lib/responses.ts
import { NextResponse } from 'next/server';
import type { ApiResponse, PaginationMeta } from '@/types';

export const ok = <T>(data: T, meta?: PaginationMeta) =>
  NextResponse.json<ApiResponse<T>>({ success: true, data, meta }, { status: 200 });

export const created = <T>(data: T) =>
  NextResponse.json<ApiResponse<T>>({ success: true, data }, { status: 201 });

export const noContent = () =>
  new NextResponse(null, { status: 204 });

export const badRequest = (message: string, code = 'BAD_REQUEST', details?: unknown) =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code, details }, { status: 400 });

export const unauthorized = (message = 'No autorizado') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'UNAUTHORIZED' }, { status: 401 });

export const forbidden = (message = 'Acceso denegado') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'FORBIDDEN' }, { status: 403 });

export const notFound = (resource = 'Recurso') =>
  NextResponse.json<ApiResponse>(
    { success: false, error: `${resource} no encontrado`, code: 'NOT_FOUND' },
    { status: 404 },
  );

export const conflict = (message: string) =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'CONFLICT' }, { status: 409 });

export const tooManyRequests = (retryAfterSeconds: number) =>
  NextResponse.json<ApiResponse>(
    { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.', code: 'RATE_LIMIT' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );

export const serverError = (message = 'Error interno del servidor') =>
  NextResponse.json<ApiResponse>({ success: false, error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
