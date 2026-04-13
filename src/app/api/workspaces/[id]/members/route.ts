// src/app/api/workspaces/[id]/members/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { ok, unauthorized } from '../../../_lib/responses';
import { requireRole, requireSameWorkspace } from '../../../_lib/authorization';
import { AppError } from '../../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/workspaces/[id]/members
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return ok(members);
});
