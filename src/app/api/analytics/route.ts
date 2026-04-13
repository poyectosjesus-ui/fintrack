// src/app/api/analytics/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok } from '../_lib/responses';
import { requireWorkspace } from '../_lib/authorization';

const AnalyticsSchema = z.object({
  from:  z.coerce.date().optional(),
  to:    z.coerce.date().optional(),
  type:  z.enum(['INCOME', 'EXPENSE']).optional(),
});

// GET /api/analytics — Resumen financiero del workspace
export const GET = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const q = AnalyticsSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

  // Por defecto: mes actual
  const now = new Date();
  const from = q.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = q.to   ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const baseWhere = {
    workspaceId: ws.user.workspaceId,
    status:      'CONFIRMED' as const,
    date:        { gte: from, lte: to },
  };

  const [incomeAgg, expenseAgg, byCategory, byMember] = await Promise.all([
    // Suma de ingresos
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'INCOME' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Suma de gastos
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Gastos por categoría
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }),
    // Gastos por miembro creador
    prisma.transaction.groupBy({
      by: ['createdById'],
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  // Enriquecer categorías con nombres
  const categoryIds = byCategory.map(c => c.categoryId);
  const categories  = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = new Map(categories.map(c => [c.id, c]));

  // Enriquecer miembros con nombres
  const memberIds = byMember.map(m => m.createdById);
  const members = await prisma.user.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const memberMap = new Map(members.map(m => [m.id, m]));

  const totalIncome  = Number(incomeAgg._sum.amount  ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return ok({
    period: { from, to },
    summary: {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      transactionCount: incomeAgg._count.id + expenseAgg._count.id,
    },
    byCategory: byCategory.map(c => ({
      category:    catMap.get(c.categoryId),
      total:       Number(c._sum.amount ?? 0),
      count:       c._count.id,
      percentage:  totalExpense > 0 ? Math.round((Number(c._sum.amount) / totalExpense) * 100) : 0,
    })),
    byMember: byMember.map(m => ({
      user:  memberMap.get(m.createdById),
      total: Number(m._sum.amount ?? 0),
      count: m._count.id,
    })),
  });
});
