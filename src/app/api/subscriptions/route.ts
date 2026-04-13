// src/app/api/subscriptions/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created } from '../_lib/responses';
import { requireWorkspace, requirePermission } from '../_lib/authorization';
import { AppError } from '../_lib/errors';

// Calcular la próxima fecha de cobro según el ciclo
function nextBillingDate(from: Date, cycle: string): Date {
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

const CreateSubscriptionSchema = z.object({
  name:            z.string().min(1).max(100).trim(),
  subCategory:     z.enum(['STREAMING','MUSIC','PRODUCTIVITY','STORAGE','WORK_TOOL','AI_TOOL','GAMING','HEALTH','EDUCATION','NEWS','SECURITY','OTHER']).default('OTHER'),
  categoryId:      z.string().cuid(),
  paymentMethodId: z.string().cuid().optional(),
  billingCycle:    z.enum(['WEEKLY','MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL']).default('MONTHLY'),
  amount:          z.number().positive(),
  currency:        z.string().length(3).default('MXN'),
  startDate:       z.coerce.date().optional(),
  provider:        z.string().max(80).optional(),
  logoUrl:         z.string().url().optional(),
  websiteUrl:      z.string().url().optional(),
  sharedWithAll:   z.boolean().default(true),
  notes:           z.string().max(500).optional(),
  trialEndDate:    z.coerce.date().optional(),
}).strict();

// GET /api/subscriptions
export const GET = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const status = req.nextUrl.searchParams.get('status');

  const subscriptions = await prisma.subscription.findMany({
    where: {
      workspaceId: ws.user.workspaceId,
      ...(status && { status: status as any }),
    },
    include: {
      category:      { select: { id: true, name: true, icon: true } },
      paymentMethod: { select: { id: true, alias: true, type: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { nextBillingDate: 'asc' },
  });

  // Añadir costo anual estimado a cada suscripción
  const enriched = subscriptions.map(s => {
    const annualCost = (() => {
      const multipliers: Record<string, number> = {
        WEEKLY: 52, MONTHLY: 12, QUARTERLY: 4, SEMI_ANNUAL: 2, ANNUAL: 1,
      };
      return Number(s.amount) * (multipliers[s.billingCycle] ?? 12);
    })();
    return { ...s, annualCostEstimate: annualCost };
  });

  return ok(enriched);
});

// POST /api/subscriptions
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageSubscriptions');

  const body = CreateSubscriptionSchema.parse(await req.json());

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, isActive: true, OR: [{ scope: 'SYSTEM' }, { workspaceId: ws.user.workspaceId }] },
  });
  if (!category) throw AppError.notFound('Categoría');

  const startDate = body.startDate ?? new Date();
  const billing   = nextBillingDate(startDate, body.billingCycle);

  const subscription = await prisma.subscription.create({
    data: {
      ...body,
      startDate,
      nextBillingDate: billing,
      workspaceId: ws.user.workspaceId,
      status: 'ACTIVE',
    },
    include: {
      category:      { select: { id: true, name: true, icon: true } },
      paymentMethod: { select: { id: true, alias: true } },
    },
  });

  return created(subscription);
});
