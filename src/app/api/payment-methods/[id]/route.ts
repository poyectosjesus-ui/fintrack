// src/app/api/payment-methods/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, noContent, unauthorized } from '../../_lib/responses';
import { requireWorkspace } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

const UpdatePaymentMethodSchema = z.object({
  alias:     z.string().min(1).max(50).trim().optional(),
  color:     z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isDefault: z.boolean().optional(),
}).strict();

// PUT /api/payment-methods/[id]
export const PUT = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const pm = await prisma.paymentMethod.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!pm) throw AppError.notFound('Método de pago');

  const body = UpdatePaymentMethodSchema.parse(await req.json());

  if (body.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { workspaceId: ws.user.workspaceId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.paymentMethod.update({ where: { id }, data: body });
  return ok(updated);
});

// DELETE /api/payment-methods/[id]
export const DELETE = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const pm = await prisma.paymentMethod.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!pm) throw AppError.notFound('Método de pago');

  // Soft delete si tiene transacciones vinculadas
  if ((pm as any)._count.transactions > 0) {
    await prisma.paymentMethod.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.paymentMethod.delete({ where: { id } });
  }

  return noContent();
});
