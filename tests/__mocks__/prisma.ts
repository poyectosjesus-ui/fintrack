// tests/__mocks__/prisma.ts
import { vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));
