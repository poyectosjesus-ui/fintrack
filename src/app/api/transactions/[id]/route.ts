// src/app/api/transactions/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, noContent } from '../../_lib/responses';
import { requireWorkspace } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  amount:          z.number().positive().optional(),
  description:     z.string().min(1).max(200).trim().optional(),
  categoryId:      z.string().cuid().optional(),
  paymentMethodId: z.string().cuid().nullable().optional(),
  date:            z.coerce.date().optional(),
  tags:            z.array(z.string().max(30)).optional(),
  notes:           z.string().max(500).trim().nullable().optional(),
  status:          z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
}).strict();

// GET /api/transactions/[id]
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const tx = await prisma.transaction.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
    include: {
      category:      true,
      paymentMethod: true,
      createdBy:     { select: { id: true, name: true, avatarUrl: true } },
      splits:        { include: { member: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
      attachments:   true,
    },
  });
  if (!tx) throw AppError.notFound('Transacción');

  return ok(tx);
});

// PUT /api/transactions/[id]
export const PUT = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!existing) throw AppError.notFound('Transacción');

  const body = UpdateSchema.parse(await req.json());

  if (body.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: body.categoryId, isActive: true, OR: [{ scope: 'SYSTEM' }, { workspaceId: ws.user.workspaceId }] },
    });
    if (!cat) throw AppError.notFound('Categoría');
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: body,
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });

  return ok(updated);
});

// DELETE /api/transactions/[id]
export const DELETE = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
  });
  if (!existing) throw AppError.notFound('Transacción');

  await prisma.transaction.delete({ where: { id } });
  return noContent();
});
