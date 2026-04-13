// tests/api/transactions/post-create.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../../__mocks__/prisma';
import { prismaMock } from '../../__mocks__/prisma';
import { mockSession } from '../../__mocks__/auth';
import { createMockRequest } from '../../helpers/request';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { auth } from '@/lib/auth';
const authMock = auth as ReturnType<typeof vi.fn>;

const validBody = {
  type:        'EXPENSE',
  amount:      350.50,
  description: 'Súper semanal',
  categoryId:  'clxabc123def456ghi789jkl0',
  currency:    'MXN',
  tags:        ['despensa'],
};

const mockMember = {
  id: 'member-001', workspaceId: mockSession.user.workspaceId!, userId: mockSession.user.id,
  role: 'OWNER', canCreateExpense: true, canCreateIncome: true,
  canManageSubscriptions: true, canManageBudgets: true, canManageMembers: true, joinedAt: new Date(),
};

const mockCategory = { id: validBody.categoryId, name: 'Alimentación', scope: 'SYSTEM', isActive: true };

const mockCreatedTx = {
  id: 'tx-new-001', ...validBody,
  date: new Date(), status: 'CONFIRMED',
  workspaceId: mockSession.user.workspaceId!, createdById: mockSession.user.id,
  category: { id: validBody.categoryId, name: 'Alimentación', icon: '🛒', color: '#ef4444' },
  paymentMethod: null, notes: null, isRecurring: false, recurringRule: null,
  paymentMethodId: null, createdAt: new Date(), updatedAt: new Date(),
};

describe('POST /api/transactions', () => {
  beforeEach(() => {
    authMock.mockResolvedValue(mockSession);
  });

  it('crea transacción exitosamente (201)', async () => {
    prismaMock.workspaceMember.findUnique.mockResolvedValue(mockMember as any);
    prismaMock.category.findFirst.mockResolvedValue(mockCategory as any);
    prismaMock.transaction.create.mockResolvedValue(mockCreatedTx as any);

    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', validBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('tx-new-001');
    expect(prismaMock.transaction.create).toHaveBeenCalledOnce();
  });

  it('rechaza amount negativo (400)', async () => {
    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', { ...validBody, amount: -100 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details.fieldErrors.amount).toBeDefined();
  });

  it('rechaza description vacía (400)', async () => {
    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', { ...validBody, description: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retorna 404 si la categoría no existe', async () => {
    prismaMock.workspaceMember.findUnique.mockResolvedValue(mockMember as any);
    prismaMock.category.findFirst.mockResolvedValue(null);

    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', validBody);
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe('NOT_FOUND');
  });

  it('retorna 401 sin sesión', async () => {
    authMock.mockResolvedValueOnce(null);

    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', validBody);
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rechaza campos extra no declarados — .strict() (400)', async () => {
    const { POST } = await import('@/app/api/transactions/route');
    const req = createMockRequest('POST', '/api/transactions', {
      ...validBody,
      hackerField: 'inject',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
