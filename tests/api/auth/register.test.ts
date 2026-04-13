// tests/api/auth/register.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../__mocks__/prisma';
import { prismaMock } from '../../__mocks__/prisma';
import { createMockRequest } from '../../helpers/request';
import { z } from 'zod';

// Mock del módulo de password con PasswordSchema real de Zod
vi.mock('@/lib/password', () => ({
  hashPassword:   vi.fn().mockResolvedValue('$2b$12$hashedpassword'),
  verifyPassword: vi.fn(),
  // Esquema real de Zod para que la integración con z.object() funcione
  PasswordSchema: z.string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener especial'),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 4, resetAt: 0, retryAfterSeconds: 0 }),
}));

const mockUser = {
  id: 'user-001', name: 'Jesús Ruiz', email: 'jesus@test.com',
  passwordHash: '$2b$12$hashed', onboardingDone: false,
  createdAt: new Date(), updatedAt: new Date(), avatarUrl: null,
  locale: 'es', timezone: 'America/Mexico_City',
};

const mockWorkspace = {
  id: 'ws-001', name: "Jesús's Workspace", slug: 'jes-workspace',
  currency: 'MXN', ownerId: 'user-001', plan: 'FREE',
  createdAt: new Date(), updatedAt: new Date(),
  description: null, logoUrl: null, isPublic: false,
};

describe('POST /api/auth/register', () => {
  const validBody = {
    name: 'Jesús Ruiz',
    email: 'jesus@test.com',
    password: 'SecurePass123!',
  };

  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.workspace.findUnique.mockResolvedValue(null);
  });

  it('registra usuario exitosamente (201)', async () => {
    prismaMock.$transaction.mockImplementation(async (fn: any) =>
      fn({
        user:            { create: vi.fn().mockResolvedValue(mockUser) },
        workspace:       { create: vi.fn().mockResolvedValue(mockWorkspace) },
        workspaceMember: { create: vi.fn().mockResolvedValue({}) },
      }),
    );

    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest('POST', '/api/auth/register', validBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('jesus@test.com');
    expect(body.data.user.passwordHash).toBeUndefined(); // nunca exponer hash
    expect(body.data.workspace.slug).toBeDefined();
  });

  it('rechaza email ya registrado (409)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest('POST', '/api/auth/register', validBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.code).toBe('CONFLICT');
  });

  it('rechaza email inválido con ZodError (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest('POST', '/api/auth/register', {
      ...validBody, email: 'no-es-un-email',
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details.fieldErrors.email).toBeDefined();
  });

  it('rechaza contraseña sin mayúscula (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest('POST', '/api/auth/register', {
      ...validBody, password: 'sinmayuscula1!',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('aplica rate limit y retorna 429', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    (rateLimit as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false, remaining: 0, resetAt: Date.now() + 3600_000, retryAfterSeconds: 3600,
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest('POST', '/api/auth/register', validBody);
    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('3600');
  });
});
