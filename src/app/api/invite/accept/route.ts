// src/app/api/invite/accept/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, unauthorized } from '../../_lib/responses';
import { AppError } from '../../_lib/errors';

const AcceptSchema = z.object({
  code: z.string().trim()
});

// POST /api/invite/accept
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { code } = AcceptSchema.parse(await req.json());

  // Buscar invitación pendiente
  const invitation = await prisma.invitation.findUnique({
    where: { code }
  });

  if (!invitation) throw AppError.notFound('Link de invitación');
  if (invitation.status !== 'PENDING') throw AppError.badRequest(`Esta invitación se encuentra en estado: ${invitation.status}`);
  if (new Date() > invitation.expiresAt) throw AppError.badRequest('Esta invitación ha expirado.');

  // Asegurar que el usuario no esté ya en el Workspace
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id
      }
    }
  });

  if (existingMember) throw AppError.badRequest('Ya eres miembro de este espacio de trabajo.');

  // Todo correcto: Crear membresía y Marcar invitación como ACCEPTED
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: invitation.role,
        canCreateExpense: invitation.role !== 'VIEWER',
        canCreateIncome: invitation.role !== 'VIEWER',
        canManageSubscriptions: invitation.role === 'ADMIN',
        canManageBudgets: invitation.role === 'ADMIN',
        canManageMembers: invitation.role === 'OWNER',
      }
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() }
    })
  ]);

  return ok({ success: true, workspaceId: invitation.workspaceId });
});
