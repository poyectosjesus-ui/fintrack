// src/app/api/invitations/[code]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, unauthorized } from '../../_lib/responses';
import { AppError } from '../../_lib/errors';

type Ctx = { params: Promise<{ code: string }> };

// POST /api/invitations/[code] — Aceptar invitación
export const POST = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { code } = await ctx.params;

  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: { workspace: { select: { id: true, name: true } } },
  });

  if (!invitation) throw AppError.notFound('Invitación');
  if (invitation.status !== 'PENDING') throw AppError.conflict('Esta invitación ya fue usada o expiró');
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { code }, data: { status: 'EXPIRED' } });
    throw AppError.conflict('Esta invitación ha expirado');
  }
  if (invitation.email !== session.user.email) {
    throw AppError.forbidden('Esta invitación no es para tu usuario');
  }

  // Verificar que no sea ya miembro
  const alreadyMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
      },
    },
  });
  if (alreadyMember) throw AppError.conflict('Ya eres miembro de este workspace');

  // Transacción: crear membership + marcar invitación como aceptada
  const result = await prisma.$transaction(async (tx) => {
    const member = await tx.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: invitation.role,
        canCreateExpense:       invitation.role !== 'VIEWER',
        canCreateIncome:        invitation.role !== 'VIEWER',
        canManageSubscriptions: invitation.role === 'ADMIN',
        canManageBudgets:       invitation.role === 'ADMIN',
        canManageMembers:       false,
      },
    });

    await tx.invitation.update({
      where: { code },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    return member;
  });

  return ok({
    workspaceId: invitation.workspaceId,
    workspaceName: invitation.workspace.name,
    role: result.role,
    message: `Te has unido a "${invitation.workspace.name}"`,
  });
});
