import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok } from '../../_lib/responses';
import { requireWorkspace } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

export const DELETE = withHandler(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const session = await auth();
  const ws = requireWorkspace(session);

  const goal = await prisma.savingsGoal.findUnique({
    where: { id }
  });

  if (!goal) {
    throw AppError.notFound('Meta de ahorro');
  }

  // Prevenir intrusiones asegurando que la meta pertenece al workspace
  if (goal.workspaceId !== ws.user.workspaceId) {
    throw AppError.forbidden('Esta meta de ahorro no corresponde a tu espacio.');
  }

  await prisma.savingsGoal.delete({
    where: { id }
  });

  return ok({ success: true, deletedId: id });
});

export const GET = withHandler(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const session = await auth();
  const ws = requireWorkspace(session);

  const goal = await prisma.savingsGoal.findUnique({
    where: { id, workspaceId: ws.user.workspaceId },
    include: {
      contributions: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!goal) {
    throw AppError.notFound('Meta de ahorro');
  }

  const progress = Math.min(100, Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100));
  const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));

  return ok({ ...goal, progress, remaining });
});
