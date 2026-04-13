// src/app/api/workspaces/[id]/invite/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { created, unauthorized } from '../../../_lib/responses';
import { requirePermission, requireSameWorkspace } from '../../../_lib/authorization';

type Ctx = { params: Promise<{ id: string }> };

const InviteSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  role:  z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

// POST /api/workspaces/[id]/invite
export const POST = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requirePermission(session, 'canManageMembers');

  const { email, role } = InviteSchema.parse(await req.json());

  // Generar código único de 8 caracteres
  const code = randomBytes(4).toString('hex').toUpperCase(); // ej: "A3F9B10C"
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      code,
      role,
      invitedById: session.user.id,
      expiresAt,
      status: 'PENDING',
    },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  return created({
    id:          invitation.id,
    code:        invitation.code,
    email:       invitation.email,
    role:        invitation.role,
    expiresAt:   invitation.expiresAt,
    workspaceName: invitation.workspace.name,
    invitedBy:   invitation.invitedBy.name,
    // URL para que el invitado la use
    inviteUrl: `${process.env.AUTH_URL}/invite/${code}`,
  });
});
