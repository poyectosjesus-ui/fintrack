import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { AppError } from '@/app/api/_lib/errors';
import { withHandler } from '@/app/api/_lib/handler';
import { ok, unauthorized } from '@/app/api/_lib/responses';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
});

export const PUT = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session) return unauthorized();

  const body = await req.json();
  const { name } = updateWorkspaceSchema.parse(body);

  // Verificar que el usuario pertenezca al workspace y tenga permisos de edición (OWNER o ADMIN)
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: id,
        userId: session.user.id,
      },
    },
  });

  if (!member) throw AppError.forbidden("No perteneces a este workspace.");
  if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
    throw AppError.forbidden("No tienes permisos suficientes para renombrar este workspace.");
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id },
    data: { name },
  });

  return ok({
    message: "Workspace actualizado con éxito",
    data: updatedWorkspace,
  });
});
