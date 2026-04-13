// src/app/api/notifications/route.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, unauthorized } from '../_lib/responses';

// GET /api/notifications — Notificaciones del usuario
export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return ok({ notifications, unreadCount });
});
