// src/app/api/transactions/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created } from '../_lib/responses';
import { requireWorkspace, requirePermission } from '../_lib/authorization';
import { AppError } from '../_lib/errors';

const ListSchema = z.object({
  type:           z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId:     z.string().cuid().optional(),
  paymentMethodId:z.string().cuid().optional(),
  from:           z.coerce.date().optional(),
  to:             z.coerce.date().optional(),
  search:         z.string().max(100).optional(),
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
});

const CreateSchema = z.object({
  type:            z.enum(['INCOME', 'EXPENSE']),
  amount:          z.number().positive('El monto debe ser positivo'),
  description:     z.string().min(1).max(200).trim(),
  categoryId:      z.string().cuid('categoryId inválido'),
  paymentMethodId: z.string().cuid().optional(),
  currency:        z.string().length(3).default('MXN'),
  date:            z.coerce.date().optional(),
  tags:            z.array(z.string().max(30)).max(10).default([]),
  notes:           z.string().max(500).trim().optional(),
  isRecurring:     z.boolean().default(false),
  recurringRule:   z.string().max(200).optional(),
}).strict();

// GET /api/transactions
export const GET = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const q = ListSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

  const where: any = { workspaceId: ws.user.workspaceId };
  if (q.type) where.type = q.type;
  if (q.categoryId) where.categoryId = q.categoryId;
  if (q.paymentMethodId) where.paymentMethodId = q.paymentMethodId;
  if (q.from || q.to) where.date = { ...(q.from && { gte: q.from }), ...(q.to && { lte: q.to }) };
  if (q.search) where.description = { contains: q.search, mode: 'insensitive' };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        category:      { select: { id: true, name: true, icon: true, color: true } },
        paymentMethod: { select: { id: true, alias: true, type: true, provider: true } },
        createdBy:     { select: { id: true, name: true, avatarUrl: true } },
        _count:        { select: { splits: true, attachments: true } },
      },
      orderBy: { date: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
  ]);

  return ok(transactions, {
    total,
    page: q.page,
    limit: q.limit,
    pages: Math.ceil(total / q.limit),
  });
});

// POST /api/transactions
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const body = CreateSchema.parse(await req.json());

  // Verificar permiso según tipo
  const permission = body.type === 'INCOME' ? 'canCreateIncome' : 'canCreateExpense';
  await requirePermission(session!, permission);

  // Verificar categoría válida
  const category = await prisma.category.findFirst({
    where: {
      id: body.categoryId,
      isActive: true,
      OR: [{ scope: 'SYSTEM' }, { scope: 'WORKSPACE', workspaceId: ws.user.workspaceId }],
    },
  });
  if (!category) throw AppError.notFound('Categoría');

  // Verificar método de pago si se especifica
  if (body.paymentMethodId) {
    const pm = await prisma.paymentMethod.findFirst({
      where: { id: body.paymentMethodId, workspaceId: ws.user.workspaceId, isActive: true },
    });
    if (!pm) throw AppError.notFound('Método de pago');
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...body,
      date:        body.date ?? new Date(),
      workspaceId: ws.user.workspaceId,
      createdById: session!.user.id,
      status:      'CONFIRMED',
    },
    include: {
      category:      { select: { id: true, name: true, icon: true, color: true } },
      paymentMethod: { select: { id: true, alias: true, type: true } },
    },
  });

  return created(transaction);
});
