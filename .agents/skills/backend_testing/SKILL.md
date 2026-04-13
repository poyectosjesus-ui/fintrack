---
name: backend-testing
version: 1.0.0
description: >
  Estrategia completa de testing para el backend de FinTrack: unit tests para
  API Routes con mock de Prisma y NextAuth, tests de integración, coverage
  mínimo del 80%, y CI/CD pipeline. Úsalo al agregar tests a cualquier endpoint,
  servicio o utilidad del backend.
tags:
  - testing
  - vitest
  - prisma
  - nextauth
  - mocking
  - backend
  - api
  - unit-tests
  - integration
stack:
  - Vitest 2+
  - @testing-library/react
  - prisma-mock (vitest-mock-extended)
  - Next.js 16 (App Router)
  - TypeScript 5+
depends-on:
  - backend-api-routes
  - backend-security
author: FinTrack Dev Team
license: MIT
---

# Skill: Backend — Testing con Vitest

Guía para escribir tests del backend: **rápidos, aislados, sin base de datos real,
sin red, sin sesión real**. Cada test debe poder correr de forma independiente.

---

## Cuándo usar este skill

- Al crear o modificar una API Route
- Al agregar una función en `src/lib/`
- Cuando el usuario pida "agrega tests" o "verifica que funciona"
- Antes de marcar una tarea como completada en el task.md

---

## 1. Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',   // Para backend — no jsdom
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/app/api/**', 'src/lib/**'],
      exclude: ['src/app/api/_lib/**', '**/*.d.ts'],
      thresholds: {
        lines:     80,   // ← Mínimo 80% coverage
        functions: 80,
        branches:  70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```typescript
// tests/setup.ts
import { vi, beforeEach } from 'vitest';

// Limpiar todos los mocks entre tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Variables de entorno para tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.AUTH_SECRET  = 'test-secret-que-tiene-mas-de-32-caracteres-para-ser-valido';
process.env.AUTH_URL     = 'http://localhost:3000';
process.env.NODE_ENV     = 'test';
```

---

## 2. Mock de Prisma

```typescript
// tests/__mocks__/prisma.ts
// Archivo de mock centralizado — se importa en todos los tests

import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep, mockReset } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

// Auto-reset entre tests
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock del módulo Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

export type PrismaMock = DeepMockProxy<PrismaClient>;
```

```bash
# Instalar dependencias de testing
npm install --save-dev vitest @vitest/coverage-v8 vitest-mock-extended
```

---

## 3. Mock de NextAuth (Sesión)

```typescript
// tests/__mocks__/auth.ts
import { vi } from 'vitest';
import type { Session } from 'next-auth';

// Sesión de usuario de prueba por defecto
export const mockSession: Session = {
  user: {
    id:          'user-test-123',
    email:       'test@fintrack.app',
    name:        'Test User',
    workspaceId: 'workspace-test-456',
    role:        'OWNER',
  },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

// Mock del módulo auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(mockSession),
}));

// Helper para cambiar la sesión en tests específicos
export function mockAuthAs(session: Partial<Session> | null) {
  const { auth } = require('@/lib/auth');
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(session);
}

export function mockUnauthenticated() {
  mockAuthAs(null);
}
```

---

## 4. Unit Tests — API Route: GET List

```typescript
// tests/api/transactions/get-list.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/transactions/route';
import { prismaMock } from '../../__mocks__/prisma';
import { mockSession, mockUnauthenticated } from '../../__mocks__/auth';
import { createMockRequest } from '../../helpers/request';
import type { Transaction, Category } from '@prisma/client';

// ── Fixtures ────────────────────────────────────────────────────────────────
const mockTransaction = {
  id:             'tx-001',
  workspaceId:    mockSession.user.workspaceId!,
  createdById:    mockSession.user.id,
  type:           'EXPENSE' as const,
  amount:         350,
  description:    'Súper semanal',
  date:           new Date('2026-04-10'),
  status:         'CONFIRMED' as const,
  currency:       'MXN',
  tags:           [],
  categoryId:     'cat-alimentos',
  category:       { id: 'cat-alimentos', name: 'Alimentación', icon: '🛒', color: '#ef4444' } as Category,
  paymentMethod:  null,
  createdBy:      { id: mockSession.user.id, name: 'Test User', avatarUrl: null },
  createdAt:      new Date(),
  updatedAt:      new Date(),
} as unknown as Transaction & { category: Category };

// ── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/transactions', () => {
  beforeEach(() => {
    // Setup Prisma mock para $transaction (COUNT + FINDMANY)
    prismaMock.$transaction.mockResolvedValue([1, [mockTransaction]]);
  });

  it('devuelve 200 con lista de transacciones', async () => {
    const req = createMockRequest('GET', '/api/transactions');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('tx-001');
    expect(body.meta.total).toBe(1);
  });

  it('devuelve 401 si no hay sesión', async () => {
    mockUnauthenticated();
    const req = createMockRequest('GET', '/api/transactions');
    const response = await GET(req);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('filtra por tipo cuando se pasa ?type=INCOME', async () => {
    prismaMock.$transaction.mockResolvedValue([0, []]);
    const req = createMockRequest('GET', '/api/transactions?type=INCOME');
    const response = await GET(req);

    expect(response.status).toBe(200);
    // Verificar que Prisma fue llamado con el filtro correcto
    expect(prismaMock.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.anything(), // count query
        expect.objectContaining({
          where: expect.objectContaining({ type: 'INCOME' }),
        }),
      ]),
    );
  });

  it('devuelve 400 si type es inválido', async () => {
    const req = createMockRequest('GET', '/api/transactions?type=INVALID');
    const response = await GET(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('pagina correctamente con page y limit', async () => {
    prismaMock.$transaction.mockResolvedValue([50, []]);
    const req = createMockRequest('GET', '/api/transactions?page=2&limit=10');
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta.page).toBe(2);
    expect(body.meta.limit).toBe(10);
    expect(body.meta.total).toBe(50);
  });
});
```

---

## 5. Unit Tests — API Route: POST Create

```typescript
// tests/api/transactions/post-create.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/transactions/route';
import { prismaMock } from '../../__mocks__/prisma';
import { mockSession } from '../../__mocks__/auth';
import { createMockRequest } from '../../helpers/request';

const validBody = {
  type:        'EXPENSE',
  amount:      350.50,
  description: 'Súper semanal',
  categoryId:  'cuid-categoría-válido',
  currency:    'MXN',
  tags:        ['despensa', 'semanal'],
};

describe('POST /api/transactions', () => {
  it('crea transacción exitosamente', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: validBody.categoryId, name: 'Alimentación', scope: 'SYSTEM',
    } as any);

    prismaMock.transaction.create.mockResolvedValue({
      id: 'new-tx-id',
      workspaceId: mockSession.user.workspaceId!,
      ...validBody,
      date: new Date(),
      status: 'CONFIRMED',
      createdById: mockSession.user.id,
      category: { name: 'Alimentación', icon: '🛒' },
    } as any);

    const req = createMockRequest('POST', '/api/transactions', validBody);
    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('new-tx-id');
    expect(prismaMock.transaction.create).toHaveBeenCalledOnce();
  });

  it('devuelve 400 si amount es negativo', async () => {
    const req = createMockRequest('POST', '/api/transactions', {
      ...validBody, amount: -100,
    });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details.fieldErrors.amount).toBeDefined();
  });

  it('devuelve 404 si la categoría no existe o no pertenece al workspace', async () => {
    prismaMock.category.findFirst.mockResolvedValue(null);

    const req = createMockRequest('POST', '/api/transactions', validBody);
    const response = await POST(req);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('rechaza campos extra no declarados en el schema', async () => {
    const req = createMockRequest('POST', '/api/transactions', {
      ...validBody,
      maliciousField: 'hack',  // Campo extra — debería rechazarse con .strict()
    });
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('devuelve 401 sin sesión', async () => {
    const { mockUnauthenticated } = await import('../../__mocks__/auth');
    mockUnauthenticated();
    const req = createMockRequest('POST', '/api/transactions', validBody);
    const response = await POST(req);

    expect(response.status).toBe(401);
  });
});
```

---

## 6. Helper: createMockRequest

```typescript
// tests/helpers/request.ts
import { NextRequest } from 'next/server';

export function createMockRequest(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');

  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '127.0.0.1',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });
}
```

---

## 7. Tests de Utilidades (lib/)

```typescript
// tests/lib/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, PasswordSchema } from '@/lib/password';

describe('Password utilities', () => {
  describe('hashPassword / verifyPassword', () => {
    it('hashea y verifica correctamente', async () => {
      const plain = 'MiPassword123!';
      const hash = await hashPassword(plain);

      expect(hash).not.toBe(plain);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt format
      expect(await verifyPassword(plain, hash)).toBe(true);
      expect(await verifyPassword('wrong', hash)).toBe(false);
    });

    it('genera hashes distintos para la misma contraseña', async () => {
      const hash1 = await hashPassword('Password123!');
      const hash2 = await hashPassword('Password123!');
      expect(hash1).not.toBe(hash2); // Salt diferente cada vez
    });
  });

  describe('PasswordSchema', () => {
    it('acepta contraseña válida', () => {
      expect(() => PasswordSchema.parse('MiPass123!')).not.toThrow();
    });

    it.each([
      ['Corta1!',          'Mínimo 8 caracteres'],
      ['sinmayuscula1!',   'Debe contener al menos una mayúscula'],
      ['SinNumero!!',      'Debe contener al menos un número'],
      ['SinEspecial123',   'Debe contener al menos un carácter especial'],
    ])('rechaza "%s" — %s', (password) => {
      expect(() => PasswordSchema.parse(password)).toThrow();
    });
  });
});
```

---

## 8. Tests de AppError

```typescript
// tests/api/_lib/errors.test.ts
import { describe, it, expect } from 'vitest';
import { AppError } from '@/app/api/_lib/errors';

describe('AppError', () => {
  it('crea error 401 con factory unauthorized()', () => {
    const err = AppError.unauthorized();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('crea error 404 con resource name', () => {
    const err = AppError.notFound('Transacción');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('Transacción');
  });

  it('incluye details en validación', () => {
    const details = { field: 'amount', issue: 'must be positive' };
    const err = AppError.validation('Datos inválidos', details);
    expect(err.details).toEqual(details);
    expect(err.statusCode).toBe(400);
  });
});
```

---

## 9. Scripts de Testing en package.json

```json
{
  "scripts": {
    "test":          "vitest run",
    "test:watch":    "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui":       "vitest --ui",
    "test:api":      "vitest run tests/api"
  }
}
```

---

## 10. CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:coverage
      - name: Check coverage thresholds
        run: |
          LINES=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$LINES < 80" | bc -l) )); then
            echo "❌ Coverage de líneas $LINES% < 80%"; exit 1
          fi
          echo "✅ Coverage: $LINES%"
```

---

## Checklist de Testing por Route

```
Al crear o modificar una API Route, verificar que hay tests para:

✅ Caso feliz (200/201) — respuesta correcta y estructura
✅ Sin sesión (401) — sin auth
✅ Sin permisos (403) — sesión válida pero sin acceso
✅ Recurso no encontrado (404)
✅ Input inválido (400 + VALIDATION_ERROR)
✅ Campos extra rechazados (400 con .strict())
✅ Cada filtro de query params
✅ Paginación (page, limit, total)
✅ Prisma llamado con los argumentos correctos
✅ Errores de Prisma (P2002 conflict, P2025 not found)
```
