// src/app/api/budgets/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created } from '../_lib/responses';
import { requireWorkspace, requirePermission } from '../_lib/authorization';
import { AppError } from '../_lib/errors';

const CreateBudgetSchema = z.object({
  categoryId: z.string().cuid(),
  amount:     z.number().positive(),
  period:     z.enum(['WEEKLY','BIWEEKLY','MONTHLY','ANNUAL']).default('MONTHLY'),
  alertAt:    z.number().int().min(1).max(100).default(80),
  rollover:   z.boolean().default(false),
  startDate:  z.coerce.date().optional(),
}).strict();

// Calcular inicio/fin del período actual
function getPeriodRange(period: string, from?: Date): { start: Date; end: Date } {
  const now = from ?? new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  if (period === 'WEEKLY') {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    end.setDate(start.getDate() + 6);
  } else if (period === 'BIWEEKLY') {
    const dayOfMonth = now.getDate();
    if (dayOfMonth <= 15) {
      start.setDate(1);
      end.setDate(15);
    } else {
      start.setDate(16);
      end.setMonth(end.getMonth() + 1, 0);
    }
  }

  return { start, end };
}

// GET /api/budgets — Lista con gasto actual calculado
export const GET = withHandler(async () => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const budgets = await prisma.budget.findMany({
    where: { workspaceId: ws.user.workspaceId, isActive: true },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Calcular gasto actual de cada presupuesto
  const enriched = await Promise.all(
    budgets.map(async (b) => {
      const { start, end } = getPeriodRange(b.period);
      const spent = await prisma.transaction.aggregate({
        where: {
          workspaceId: ws.user.workspaceId,
          categoryId:  b.categoryId,
          type:        'EXPENSE',
          status:      'CONFIRMED',
          date:        { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const spentAmount = Number(spent._sum.amount ?? 0);
      const budgetAmount = Number(b.amount);
      const percentage = Math.round((spentAmount / budgetAmount) * 100);

      return {
        ...b,
        spent:      spentAmount,
        remaining:  Math.max(0, budgetAmount - spentAmount),
        percentage,
        isOverBudget: spentAmount > budgetAmount,
        isAlert:    percentage >= b.alertAt,
        periodStart: start,
        periodEnd:   end,
      };
    }),
  );

  return ok(enriched);
});

// POST /api/budgets
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);
  await requirePermission(session!, 'canManageBudgets');

  const body = CreateBudgetSchema.parse(await req.json());

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: ws.user.workspaceId, userId: session!.user.id } },
  });
  if (!member || !member.canManageBudgets) throw AppError.forbidden('No tienes permiso para gestionar presupuestos');

  const category = await prisma.category.findFirst({
    where: { id: body.categoryId, isActive: true, OR: [{ scope: 'SYSTEM' }, { workspaceId: ws.user.workspaceId }] },
  });
  if (!category) throw AppError.notFound('Categoría');

  const budget = await prisma.budget.create({
    data: {
      ...body,
      startDate:   body.startDate ?? new Date(),
      workspaceId: ws.user.workspaceId,
    },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });

  return created(budget);
});
