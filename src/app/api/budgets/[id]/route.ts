import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok } from '../../_lib/responses';
import { requireWorkspace, requirePermission } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

export const DELETE = withHandler(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageBudgets');

  // Verify membership permissions and existence of the budget
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: ws.user.workspaceId, userId: session!.user.id } },
  });

  if (!member || !member.canManageBudgets) {
    throw AppError.forbidden('No tienes permiso para eliminar presupuestos.');
  }

  const budget = await prisma.budget.findUnique({
    where: { id }
  });

  if (!budget) {
    throw AppError.notFound('Presupuesto');
  }

  // Prevenir intrusismo entre workspaces
  if (budget.workspaceId !== ws.user.workspaceId) {
    throw AppError.forbidden('Este presupuesto no pertenece a tu espacio.');
  }

  await prisma.budget.delete({
    where: { id }
  });

  return ok({ success: true, deletedId: id });
});
