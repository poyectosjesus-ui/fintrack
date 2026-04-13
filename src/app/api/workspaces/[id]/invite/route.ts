// src/app/api/workspaces/[id]/invite/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { AppError } from '../../../_lib/errors';
import { withHandler } from '../../../_lib/handler';
import { created, unauthorized, ok } from '../../../_lib/responses';
import { requirePermission, requireSameWorkspace } from '../../../_lib/authorization';

type Ctx = { params: Promise<{ id: string }> };

const InviteSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  role:  z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

// POST /api/workspaces/[id]/invite
export const POST = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requirePermission(session, 'canManageMembers');

  const { email, role } = InviteSchema.parse(await req.json());

  // Generar código único de 8 caracteres
  const code = randomBytes(4).toString('hex').toUpperCase(); // ej: "A3F9B10C"
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      code,
      role,
      invitedById: session.user.id,
      expiresAt,
      status: 'PENDING',
    },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  const inviteUrl = `${process.env.AUTH_URL}/invite/${code}`;

  // Despachar el Email vía Resend si está configurado
  if (resend) {
    try {
      await resend.emails.send({
        from: 'proyetosjesus@gmail.com', // Dirección solicitada
        to: email,
        subject: `Invitación a Workspace: ${invitation.workspace.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">FinTrack Enterprise</h1>
            </div>
            <div style="padding: 40px; text-align: center; background-color: #ffffff;">
              <h2 style="color: #111827; font-size: 20px; font-weight: bold;">Has sido invitado a una bóveda financiera</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 16px;">
                <strong>${invitation.invitedBy.name}</strong> te ha invitado a co-administrar el espacio financiero <strong>"${invitation.workspace.name}"</strong> con rol de administrador/miembro.
              </p>
              <a href="${inviteUrl}" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 24px; font-size: 16px;">
                Aceptar Invitación Segura
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
                Este enlace expirará en 7 días.<br>Código manual: ${code}
              </p>
            </div>
          </div>
        `
      });
    } catch (e: any) {
      console.error("\n=== ERROR GRAVE EN RESEND ===");
      console.error(e?.name || 'Unknown Error');
      console.error(e?.message || e);
      console.error("===============================\n");
    }
  }

  return created({
    id:          invitation.id,
    code:        invitation.code,
    email:       invitation.email,
    role:        invitation.role,
    expiresAt:   invitation.expiresAt,
    workspaceName: invitation.workspace.name,
    invitedBy:   invitation.invitedBy.name,
    inviteUrl
  });
});

// GET /api/workspaces/[id]/invite
export const GET = withHandler(async (_req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requirePermission(session, 'canManageMembers');

  const invitations = await prisma.invitation.findMany({
    where: { 
      workspaceId,
      status: { in: ['PENDING', 'EXPIRED'] }
    },
    include: {
      invitedBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return ok(invitations.map(inv => ({
    ...inv,
    inviteUrl: `${process.env.AUTH_URL}/invite/${inv.code}`
  })));
});

// DELETE /api/workspaces/[id]/invite?inviteId=xxx
export const DELETE = withHandler(async (req: NextRequest, ctx: Ctx) => {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id: workspaceId } = await ctx.params;
  requireSameWorkspace(workspaceId, session);
  await requirePermission(session, 'canManageMembers');

  const inviteId = req.nextUrl.searchParams.get('inviteId');
  if (!inviteId) throw new AppError('inviteId is required', 400);

  // We do not physically delete, we revoke it for security audits
  await prisma.invitation.update({
    where: { id: inviteId, workspaceId },
    data: { status: 'REVOKED' }
  });

  return ok({ success: true });
});
