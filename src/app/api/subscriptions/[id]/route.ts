// src/app/api/subscriptions/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, noContent } from '../../_lib/responses';
import { requireWorkspace, requirePermission } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  name:            z.string().min(1).max(100).trim().optional(),
  amount:          z.number().positive().optional(),
  currency:        z.string().length(3).optional(),
  paymentMethodId: z.string().cuid().nullable().optional(),
  nextBillingDate: z.coerce.date().optional(),
  notes:           z.string().max(500).nullable().optional(),
  sharedWithAll:   z.boolean().optional(),
}).strict();

//  GET /api/subscriptions/[id]
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  const { id } = await ctx.params;

  const sub = await prisma.subscription.findFirst({
    where: { id, workspaceId: ws.user.workspaceId },
    include: {
      category:      true,
      paymentMethod: true,
      payments: { orderBy: { billingDate: 'desc' }, take: 12 },
    },
  });
  if (!sub) throw AppError.notFound('Suscripción');

  return ok(sub);
});

// PUT /api/subscriptions/[id]
export const PUT = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageSubscriptions');
  const { id } = await ctx.params;

  const sub = await prisma.subscription.findFirst({ where: { id, workspaceId: ws.user.workspaceId } });
  if (!sub) throw AppError.notFound('Suscripción');

  const body = UpdateSchema.parse(await req.json());
  const updated = await prisma.subscription.update({ where: { id }, data: body });
  return ok(updated);
});

// DELETE /api/subscriptions/[id]
export const DELETE = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageSubscriptions');
  const { id } = await ctx.params;

  const sub = await prisma.subscription.findFirst({ where: { id, workspaceId: ws.user.workspaceId } });
  if (!sub) throw AppError.notFound('Suscripción');

  // Marcar como cancelada en vez de eliminar (preservar historial)
  await prisma.subscription.update({
    where: { id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  return noContent();
});
