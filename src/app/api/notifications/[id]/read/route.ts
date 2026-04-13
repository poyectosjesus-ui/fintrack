// src/app/api/notifications/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../../_lib/handler';
import { ok, unauthorized } from '../../../_lib/responses';
import { AppError } from '../../../_lib/errors';

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/notifications/[id]/read
export const PUT = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await ctx.params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!notification) throw AppError.notFound('Notificación');

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return ok(updated);
});
