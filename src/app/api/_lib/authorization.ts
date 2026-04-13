// src/app/api/_lib/authorization.ts
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { AppError } from './errors';

export type Permission =
  | 'canCreateExpense'
  | 'canCreateIncome'
  | 'canManageSubscriptions'
  | 'canManageBudgets'
  | 'canManageMembers';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Obtiene la membresía activa del usuario o lanza AppError si no pertenece al workspace
 */
async function getMembership(session: Session) {
  if (!session.user.workspaceId) {
    throw AppError.forbidden('No perteneces a ningún workspace');
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
      },
    },
  });

  if (!member) throw AppError.forbidden('No eres miembro de este workspace');
  return member;
}

/**
 * Verifica que el usuario tiene el permiso granular requerido
 */
export async function requirePermission(session: Session, permission: Permission) {
  const member = await getMembership(session);
  // El OWNER es un administrador absoluto y puede hacer cualquier cosa
  if (member.role === 'OWNER') return member;
  
  if (!member[permission]) {
    throw AppError.forbidden(`No tienes permiso para realizar esta acción: ${permission}`);
  }
  return member;
}

/**
 * Verifica que el usuario tiene uno de los roles requeridos
 */
export async function requireRole(session: Session, ...roles: Role[]) {
  const member = await getMembership(session);
  if (!roles.includes(member.role as Role)) {
    throw AppError.forbidden(`Requiere rol: ${roles.join(' o ')}`);
  }
  return member;
}

/**
 * Verifica que un recurso pertenece al mismo workspace que el usuario
 */
export function requireSameWorkspace(resourceWorkspaceId: string, session: Session) {
  if (resourceWorkspaceId !== session.user.workspaceId) {
    throw AppError.forbidden('No tienes acceso a este recurso');
  }
}

/**
 * Verifica sesión y retorna el workspaceId, lanzando si no existe
 */
export function requireWorkspace(session: Session | null): Session & { user: { workspaceId: string } } {
  if (!session?.user) throw AppError.unauthorized();
  if (!session.user.workspaceId) throw AppError.badRequest('Debes pertenecer a un workspace');
  return session as Session & { user: { workspaceId: string } };
}
