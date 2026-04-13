// src/app/api/workspaces/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created, unauthorized } from '../_lib/responses';
import { AppError } from '../_lib/errors';

const CreateWorkspaceSchema = z.object({
  name:     z.string().min(2).max(60).trim(),
  currency: z.string().length(3).default('MXN'),
  description: z.string().max(200).optional(),
});

// GET /api/workspaces — Mi workspace activo con miembros
export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!session.user.workspaceId) throw AppError.notFound('Workspace');

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.user.workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { transactions: true, subscriptions: true } },
    },
  });

  if (!workspace) throw AppError.notFound('Workspace');
  return ok(workspace);
});

// POST /api/workspaces — Crear workspace adicional
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = CreateWorkspaceSchema.parse(await req.json());

  function slugify(t: string) {
    return t.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').slice(0, 50);
  }

  let slug = slugify(body.name);
  const exists = await prisma.workspace.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: { ...body, slug, ownerId: session.user.id },
    });
    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id, userId: session.user.id, role: 'OWNER',
        canCreateExpense: true, canCreateIncome: true,
        canManageSubscriptions: true, canManageBudgets: true, canManageMembers: true,
      },
    });
    return ws;
  });

  return created(result);
});
