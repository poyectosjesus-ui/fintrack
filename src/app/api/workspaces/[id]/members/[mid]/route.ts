// src/app/api/workspaces/[id]/members/[mid]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../../_lib/handler';
import { ok, noContent, unauthorized } from '../../../../_lib/responses';
import { requireRole, requireSameWorkspace } from '../../../../_lib/authorization';
import { AppError } from '../../../../_lib/errors';

type Ctx = { params: Promise<{ id: string; mid: string }> };

const UpdateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
}).strict();

// PUT /api/workspaces/[id]/members/[mid] — Cambiar rol
export const PUT = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId, mid: memberId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requireRole(session, 'OWNER', 'ADMIN');

  const member = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!member || member.workspaceId !== workspaceId) throw AppError.notFound('Miembro');
  if (member.role === 'OWNER') throw AppError.forbidden('No puedes cambiar el rol del OWNER');
  if (member.userId === session.user.id) throw AppError.forbidden('No puedes cambiar tu propio rol');

  const { role } = UpdateMemberSchema.parse(await req.json());
  const updated = await prisma.workspaceMember.update({ where: { id: memberId }, data: { role } });

  return ok(updated);
});

// DELETE /api/workspaces/[id]/members/[mid] — Expulsar miembro
export const DELETE = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId, mid: memberId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requireRole(session, 'OWNER');

  const member = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!member || member.workspaceId !== workspaceId) throw AppError.notFound('Miembro');
  if (member.role === 'OWNER') throw AppError.forbidden('No puedes expulsar al OWNER');
  if (member.userId === session.user.id) throw AppError.forbidden('No puedes expulsarte a ti mismo');

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  return noContent();
});
