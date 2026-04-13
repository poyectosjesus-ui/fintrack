// tests/setup.ts
import { vi, beforeEach } from 'vitest';

// Limpiar todos los mocks entre tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Variables de entorno para el entorno de test
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.AUTH_SECRET  = 'test-secret-para-vitest-debe-tener-mas-de-32-chars';
process.env.AUTH_URL     = 'http://localhost:3000';
// NODE_ENV es read-only — Vitest lo establece en 'test' automáticamente
