// src/app/api/invite/[code]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, notFound } from '../../_lib/responses';
import { AppError } from '../../_lib/errors';

type Ctx = { params: Promise<{ code: string }> };

// GET /api/invite/[code] (Público)
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const { code } = await ctx.params;

  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: {
      workspace: { select: { name: true, avatarUrl: true } },
      invitedBy: { select: { name: true, avatarUrl: true } }
    }
  });

  if (!invitation) return notFound('Invitación no encontrada');

  // Incluso si expiró, devolvemos el UI para decirle "Expiró".
  return ok({
    id: invitation.id,
    code: invitation.code,
    status: invitation.status,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    workspace: invitation.workspace,
    invitedBy: invitation.invitedBy
  });
});
