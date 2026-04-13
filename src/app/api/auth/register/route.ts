// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, PasswordSchema } from '@/lib/password';
import { rateLimit } from '@/lib/rate-limit';
import { withHandler } from '../../_lib/handler';
import { created, tooManyRequests } from '../../_lib/responses';
import { AppError } from '../../_lib/errors';

const RegisterSchema = z.object({
  name:     z.string().min(2, 'Nombre mínimo 2 caracteres').max(80).trim(),
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: PasswordSchema,
  workspaceName: z.string().min(2).max(60).trim().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const exists = await prisma.workspace.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    attempt++;
  }
}

export const POST = withHandler(async (req: NextRequest) => {
  // Rate limit: máximo 5 registros por IP por hora
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
  const limit = await rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  const body = RegisterSchema.parse(await req.json());

  // Verificar que el email no esté registrado
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw AppError.conflict('Este email ya está registrado');

  const passwordHash = await hashPassword(body.password);
  const wsName = body.workspaceName ?? `${body.name.split(' ')[0]}'s Workspace`;
  const slug = await uniqueSlug(wsName);

  // Transacción: crear usuario + workspace + membership (todo o nada)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        onboardingDone: false,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: wsName,
        slug,
        currency: 'MXN',
        ownerId: user.id,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'OWNER',
        canCreateExpense: true,
        canCreateIncome: true,
        canManageSubscriptions: true,
        canManageBudgets: true,
        canManageMembers: true,
      },
    });

    return { user, workspace };
  });

  return created({
    user: {
      id:    result.user.id,
      name:  result.user.name,
      email: result.user.email,
    },
    workspace: {
      id:   result.workspace.id,
      name: result.workspace.name,
      slug: result.workspace.slug,
    },
  });
});
