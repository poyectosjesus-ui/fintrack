// src/app/api/savings/[id]/contribute/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { created } from '../../../_lib/responses';
import { requireWorkspace } from '../../../_lib/authorization';
import { AppError } from '../../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

const ContributeSchema = z.object({
  amount: z.number().refine(val => val !== 0, 'El monto no puede ser cero'),
  note:   z.string().max(200).optional(),
  date:   z.coerce.date().optional(),
}).strict();

// POST /api/savings/[id]/contribute
export const POST = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!goal) throw AppError.notFound('Meta de ahorro');
  if (goal.isCompleted) throw AppError.conflict('Esta meta ya está completada');

  const body = ContributeSchema.parse(await req.json());

  // Buscar membresía
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: ws.user.workspaceId, userId: session!.user.id } },
  });
  if (!member) throw AppError.forbidden('No eres miembro del workspace');

  // Transacción: crear aportación + actualizar currentAmount del goal
  const newAmount = Math.max(0, Math.min(
    Number(goal.currentAmount) + body.amount,
    Number(goal.targetAmount)
  ));
  const isNowCompleted = newAmount >= Number(goal.targetAmount) && newAmount > 0;

  const [contribution] = await prisma.$transaction([
    prisma.savingsContribution.create({
      data: {
        goalId:   id,
        memberId: member.id,
        userId:   session!.user.id,
        amount:   body.amount,
        note:     body.note,
        date:     body.date ?? new Date(),
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        ...(isNowCompleted && { isCompleted: true, completedAt: new Date() }),
      },
    }),
    // Notificación si se completó la meta
    ...(isNowCompleted ? [
      prisma.notification.create({
        data: {
          userId:      session!.user.id,
          workspaceId: ws.user.workspaceId,
          type:        'GOAL_REACHED',
          title:       '🎯 ¡Meta alcanzada!',
          message:     `La meta "${goal.name}" fue completada.`,
          actionUrl:   `/savings/${id}`,
          relatedId:   id,
        },
      }),
    ] : []),
  ]);

  return created({
    contribution,
    goal: {
      id,
      currentAmount: newAmount,
      isCompleted:   isNowCompleted,
    },
  });
});
