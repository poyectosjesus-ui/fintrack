// src/app/api/payment-methods/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withHandler } from '../_lib/handler';
import { ok, created, unauthorized } from '../_lib/responses';
import { requireWorkspace } from '../_lib/authorization';

const CreatePaymentMethodSchema = z.object({
  type:      z.enum(['CASH','DEBIT_CARD','CREDIT_CARD','TRANSFER','DIGITAL_WALLET','CRYPTO']),
  provider:  z.enum(['VISA','MASTERCARD','AMEX','PAYPAL','MERCADO_PAGO','CLIP','OXXO_PAY','STRIPE','BBVA','BANAMEX','SANTANDER','HSBC','BANREGIO','NU_BANK','OTHER']).default('OTHER'),
  alias:     z.string().min(1).max(50).trim(),
  last4:     z.string().length(4).regex(/^\d{4}$/).optional(),
  color:     z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  isDefault: z.boolean().default(false),
}).strict();

// GET /api/payment-methods
export const GET = withHandler(async () => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const methods = await prisma.paymentMethod.findMany({
    where: { workspaceId: ws.user.workspaceId, isActive: true },
    include: { _count: { select: { transactions: true } } },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });

  return ok(methods);
});

// POST /api/payment-methods
export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  const ws = requireWorkspace(session);

  const body = CreatePaymentMethodSchema.parse(await req.json());

  // Si isDefault=true, quitar isDefault de los demás
  if (body.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { workspaceId: ws.user.workspaceId, isDefault: true },
      data:  { isDefault: false },
    });
  }

  const method = await prisma.paymentMethod.create({
    data: {
      ...body,
      workspaceId: ws.user.workspaceId,
      createdById: session!.user.id,
    },
  });

  return created(method);
});
