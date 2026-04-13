// src/app/api/subscriptions/[id]/toggle/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { ok } from '../../../_lib/responses';
import { requireWorkspace, requirePermission } from '../../../_lib/authorization';
import { AppError } from '../../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

function addCycleDays(from: Date, cycle: string): Date {
  const d = new Date(from);
  switch (cycle) {
    case 'WEEKLY':      d.setDate(d.getDate() + 7);     break;
    case 'MONTHLY':     d.setMonth(d.getMonth() + 1);   break;
    case 'QUARTERLY':   d.setMonth(d.getMonth() + 3);   break;
    case 'SEMI_ANNUAL': d.setMonth(d.getMonth() + 6);   break;
    case 'ANNUAL':      d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

// POST /api/subscriptions/[id]/toggle
export const POST = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageSubscriptions');
  const { id } = await ctx.params;

  const sub = await prisma.subscription.findFirst({ where: { id, workspaceId: ws.user.workspaceId } });
  if (!sub) throw AppError.notFound('Suscripción');
  if (sub.status === 'CANCELLED') throw AppError.conflict('Una suscripción cancelada no se puede reactivar');

  const isActive = sub.status === 'ACTIVE';
  const newStatus = isActive ? 'PAUSED' : 'ACTIVE';

  // Al reactivar: recalcular nextBillingDate desde hoy
  const nextBillingDate = !isActive ? addCycleDays(new Date(), sub.billingCycle) : sub.nextBillingDate;

  const updated = await prisma.subscription.update({
    where: { id },
    data: { status: newStatus, nextBillingDate },
  });

  return ok({ ...updated, toggled: true });
});
