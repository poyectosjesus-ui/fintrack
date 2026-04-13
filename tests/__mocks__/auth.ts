// tests/__mocks__/auth.ts
import { vi } from 'vitest';
import type { Session } from 'next-auth';

export const mockSession: Session = {
  user: {
    id:          'user-test-123',
    email:       'jesus@fintrack.app',
    name:        'Jesús Ruiz',
    image:       null,
    workspaceId: 'workspace-test-456',
    role:        'OWNER',
  },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(mockSession),
  signIn:  vi.fn(),
  signOut: vi.fn(),
}));

/** Sobreescribir la sesión para un test específico */
export async function mockAuthAs(session: Partial<Session> | null) {
  const { auth } = await import('@/lib/auth');
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(session);
}

/** Simular usuario no autenticado */
export async function mockUnauthenticated() {
  await mockAuthAs(null);
}

/** Simular usuario sin workspace */
export async function mockNoWorkspace() {
  await mockAuthAs({
    ...mockSession,
    user: { ...mockSession.user, workspaceId: null, role: null },
  });
}
