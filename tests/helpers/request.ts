// tests/helpers/request.ts
import { NextRequest } from 'next/server';

export function createMockRequest(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');

  return new NextRequest(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '127.0.0.1',
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
}

/** Crea un request con query params */
export function createMockRequestWithParams(
  method: string,
  path: string,
  params: Record<string, string>,
  body?: unknown,
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return createMockRequest(method, url.toString(), body);
}

/** Crea un contexto de route con params dinámicos */
export function createMockCtx(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}
