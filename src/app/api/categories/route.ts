// src/app/api/categories/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created, unauthorized } from '../_lib/responses';
import { requireWorkspace } from '../_lib/authorization';
import { AppError } from '../_lib/errors';

const CreateCategorySchema = z.object({
  name:      z.string().min(1).max(60).trim(),
  type:      z.enum(['INCOME', 'EXPENSE']),
  icon:      z.string().min(1).max(50).default('Tag'), // Usamos strings limpias para llaves de Lucide
  color:     z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color debe ser hex p.ej. #ab12cd').default('#6366f1'),
  parentId:  z.string().cuid().optional(),
  sortOrder: z.number().int().min(0).default(0),
}).strict();

// GET /api/categories — Árbol de categorías (sistema + workspace)
export const GET = withHandler(async () => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { scope: 'SYSTEM' },
        { scope: 'WORKSPACE', workspaceId: ws.user.workspaceId },
      ],
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  // Construir árbol jerárquico
  const map = new Map<string, any>();
  const roots: any[] = [];

  categories.forEach(c => map.set(c.id, { ...c, children: [] }));
  categories.forEach(c => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(map.get(c.id));
    } else {
      roots.push(map.get(c.id));
    }
  });

  return ok(roots);
});

// POST /api/categories — Crear categoría personalizada del workspace
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const body = CreateCategorySchema.parse(await req.json());

  // Si tiene parentId, verificar que existe
  if (body.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: body.parentId } });
    if (!parent) throw AppError.notFound('Categoría padre');
  }

  const category = await prisma.category.create({
    data: {
      ...body,
      scope:       'WORKSPACE',
      workspaceId: ws.user.workspaceId,
    },
  });

  return created(category);
});
