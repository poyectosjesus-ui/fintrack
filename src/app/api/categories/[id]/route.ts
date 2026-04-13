import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, unauthorized, badRequest } from '../../_lib/responses';
import { requireWorkspace } from '../../_lib/authorization';
import { AppError } from '../../_lib/errors';

export const DELETE = withHandler(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const session = await auth();
  const ws = requireWorkspace(session);

  // Verificamos que la categoría exista
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    throw AppError.notFound('Categoría');
  }

  // Prevenir borrar categorías base (Sistema) a menos que se quiera permitir (lo vamos a bloquear por seguridad general)
  if (category.scope === 'SYSTEM') {
    throw AppError.forbidden('No puedes eliminar categorías globales del Sistema central.');
  }

  // Prevenir intrusismo entre workspaces
  if (category.workspaceId !== ws.user.workspaceId) {
    throw AppError.forbidden('Esta categoría no pertenece a tu espacio de trabajo.');
  }

  try {
    await prisma.category.delete({
      where: { id }
    });
    return ok({ success: true, deletedId: id });
  } catch (error: any) {
    // Si la DB arroja P2003 significa que la categoría tiene Transacciones hijas ligadas a ella.
    if (error.code === 'P2003') {
       throw AppError.badRequest('No puedes eliminar una categoría que ya contiene transacciones contabilizadas.');
    }
    throw error;
  }
});
