// src/app/api/savings/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created } from '../_lib/responses';
import { requireWorkspace } from '../_lib/authorization';

const CreateGoalSchema = z.object({
  name:         z.string().min(1).max(100).trim(),
  type:         z.enum(['EMERGENCY','VACATION','HOME','CAR','EDUCATION','INVESTMENT','TECH','WEDDING','BABY','CUSTOM']).default('CUSTOM'),
  icon:         z.string().default('Target'),
  description:  z.string().max(500).trim().optional(),
  targetAmount: z.number().positive(),
  dueDate:      z.coerce.date().min(new Date(), 'La fecha debe ser futura').optional(),
  priority:     z.enum(['LOW','MEDIUM','HIGH']).default('MEDIUM'),
  isShared:     z.boolean().default(true),
}).strict();

// GET /api/savings
export const GET = withHandler(async () => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const goals = await prisma.savingsGoal.findMany({
    where: { workspaceId: ws.user.workspaceId },
    include: {
      contributions: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      },
      _count: { select: { contributions: true } },
    },
    orderBy: [{ isCompleted: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  });

  const enriched = goals.map(g => {
    const progress = Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100));
    const remaining = Math.max(0, Number(g.targetAmount) - Number(g.currentAmount));
    return { ...g, progress, remaining };
  });

  return ok(enriched);
});

// POST /api/savings
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const body = CreateGoalSchema.parse(await req.json());

  const goal = await prisma.savingsGoal.create({
    data: { ...body, workspaceId: ws.user.workspaceId, currentAmount: 0 },
  });

  return created(goal);
});
