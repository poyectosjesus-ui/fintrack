import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { AppError, errorHandler } from '@/app/api/_lib/errors';
import { z } from 'zod';

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
});

export const PUT = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session) throw AppError.Unauthorized();

  const body = await req.json();
  const { name } = updateWorkspaceSchema.parse(body);

  // Verificar que el usuario pertenezca al workspace y tenga permisos de edición (OWNER o ADMIN)
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: params.id,
        userId: session.user.id,
      },
    },
  });

  if (!member) throw AppError.Forbidden("No perteneces a este workspace.");
  if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
    throw AppError.Forbidden("No tienes permisos suficientes para renombrar este workspace.");
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: params.id },
    data: { name },
  });

  return NextResponse.json({
    message: "Workspace actualizado con éxito",
    data: updatedWorkspace,
  });
});
