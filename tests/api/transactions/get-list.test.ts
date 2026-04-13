// tests/api/transactions/get-list.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import '../../__mocks__/prisma';
import { prismaMock } from '../../__mocks__/prisma';
import { mockSession } from '../../__mocks__/auth';
import { createMockRequest, createMockRequestWithParams } from '../../helpers/request';

// Mock auth antes de cualquier import de rutas
import { vi } from 'vitest';
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { auth } from '@/lib/auth';
const authMock = auth as ReturnType<typeof vi.fn>;

const mockTx = {
  id: 'tx-001',
  workspaceId: mockSession.user.workspaceId!,
  type: 'EXPENSE',
  amount: 350,
  description: 'Súper semanal',
  date: new Date('2026-04-10'),
  status: 'CONFIRMED',
  currency: 'MXN',
  tags: [],
  categoryId: 'cat-001',
  category: { id: 'cat-001', name: 'Alimentación', icon: '🛒', color: '#ef4444' },
  paymentMethod: null,
  createdById: mockSession.user.id,
  createdBy: { id: mockSession.user.id, name: 'Jesús Ruiz', avatarUrl: null },
  _count: { splits: 0, attachments: 0 },
  notes: null, isRecurring: false, recurringRule: null, paymentMethodId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('GET /api/transactions', () => {
  beforeEach(() => {
    // Restaurar sesión autenticada antes de cada test
    authMock.mockResolvedValue(mockSession);
  });

  it('retorna 200 con lista paginada', async () => {
    prismaMock.$transaction.mockResolvedValue([1, [mockTx]] as any);

    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequest('GET', '/api/transactions');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
    expect(body.meta.pages).toBe(1);
  });

  it('retorna 401 sin sesión', async () => {
    authMock.mockResolvedValueOnce(null);

    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequest('GET', '/api/transactions');
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('UNAUTHORIZED');
  });

  it('filtra por type=EXPENSE correctamente', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []] as any);

    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequestWithParams('GET', '/api/transactions', { type: 'EXPENSE' });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('rechaza type inválido (400)', async () => {
    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequestWithParams('GET', '/api/transactions', { type: 'INVALID' });
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('VALIDATION_ERROR');
  });

  it('pagina correctamente con page=2&limit=5', async () => {
    prismaMock.$transaction.mockResolvedValue([50, []] as any);

    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequestWithParams('GET', '/api/transactions', { page: '2', limit: '5' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.meta.page).toBe(2);
    expect(body.meta.limit).toBe(5);
    expect(body.meta.total).toBe(50);
    expect(body.meta.pages).toBe(10);
  });

  it('retorna 400 si no hay workspaceId en sesión', async () => {
    authMock.mockResolvedValueOnce({
      ...mockSession, user: { ...mockSession.user, workspaceId: null },
    });

    const { GET } = await import('@/app/api/transactions/route');
    const req = createMockRequest('GET', '/api/transactions');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });
});
