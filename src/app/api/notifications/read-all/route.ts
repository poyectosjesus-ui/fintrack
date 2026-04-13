// src/app/api/notifications/read-all/route.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../../_lib/handler';
import { ok, unauthorized } from '../../_lib/responses';

// PUT /api/notifications/read-all
export const PUT = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { count } = await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return ok({ markedAsRead: count });
});
