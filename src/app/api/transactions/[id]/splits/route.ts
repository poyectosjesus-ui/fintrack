// src/app/api/transactions/[id]/splits/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { ok, created } from '../../../_lib/responses';
import { requireWorkspace } from '../../../_lib/authorization';
import { AppError } from '../../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

const SplitSchema = z.object({
  splits: z.array(z.object({
    memberId: z.string().cuid(),
    amount:   z.number().positive(),
    note:     z.string().max(200).optional(),
  })).min(2, 'Debes dividir entre al menos 2 miembros'),
}).strict();

// GET /api/transactions/[id]/splits
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const tx = await prisma.transaction.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!tx) throw AppError.notFound('Transacción');

  const splits = await prisma.transactionSplit.findMany({
    where: { transactionId: id },
    include: {
      member: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  return ok(splits);
});

// POST /api/transactions/[id]/splits
export const POST = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const tx = await prisma.transaction.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!tx) throw AppError.notFound('Transacción');

  const { splits } = SplitSchema.parse(await req.json());

  // Validar que la suma de splits no exceda el monto de la transacción
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  if (total > Number(tx.amount) + 0.01) {
    throw AppError.badRequest(
      `La suma de partes (${total}) excede el monto de la transacción (${tx.amount})`,
    );
  }

  // Validar que todos los memberId pertenecen al workspace
  const memberIds = splits.map(s => s.memberId);
  const members = await prisma.workspaceMember.findMany({
    where: { id: { in: memberIds }, workspaceId: ws.user.workspaceId },
  });
  if (members.length !== memberIds.length) {
    throw AppError.badRequest('Uno o más miembros no pertenecen a este workspace');
  }

  // Eliminar splits previos y crear los nuevos (idempotente)
  await prisma.$transaction([
    prisma.transactionSplit.deleteMany({ where: { transactionId: id } }),
    prisma.transactionSplit.createMany({
      data: splits.map(s => ({ transactionId: id, ...s })),
    }),
  ]);

  const created_splits = await prisma.transactionSplit.findMany({
    where: { transactionId: id },
    include: { member: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
  });

  return created(created_splits);
});
