// src/app/api/invite/accept/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../api/_lib/handler';
import { ok, unauthorized } from '../../api/_lib/responses';
import { AppError } from '../../api/_lib/errors';

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

  if (!invitation) throw new AppError('Link de invitación inválido o no existe.', 404);
  if (invitation.status !== 'PENDING') throw new AppError(`Esta invitación se encuentra en estado: ${invitation.status}`, 400);
  if (new Date() > invitation.expiresAt) throw new AppError('Esta invitación ha expirado.', 400);

  // Asegurar que el usuario no esté ya en el Workspace
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id
      }
    }
  });

  if (existingMember) throw new AppError('Ya eres miembro de este espacio de trabajo.', 400);

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
