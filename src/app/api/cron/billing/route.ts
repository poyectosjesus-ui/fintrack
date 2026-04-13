// src/app/api/cron/billing/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '../../_lib/responses';
import { addDays, addMonths, addYears } from 'date-fns';

export const maxDuration = 60; // 60 segundos si el volumen es alto en vercel.

// GET /api/cron/billing
export const GET = async (req: NextRequest) => {
  // Proteger la ejecución del demonio. 
  // En local no hace falta si no hay CRON_SECRET, pero en pro debe estar protegido.
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();

  // Buscar todas las suscripciones a las que ya se les pasó la fecha de corte.
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: { lte: now }
    },
    include: {
       workspace: {
          select: { id: true, ownerId: true }
       }
    }
  });

  if (dueSubscriptions.length === 0) {
    return ok({ message: "No hay cargos de suscripciones pendientes por el momento.", count: 0 });
  }

  let processedCount = 0;

  for (const sub of dueSubscriptions) {
    try {
      // 1. Calcular la siguiente fecha dependiendo de la facturación
      let nextDate = sub.nextBillingDate;
      // Loop por si lleva múltiples ciclos de retraso
      while (nextDate <= now) {
         if (sub.billingCycle === 'WEEKLY') nextDate = addDays(nextDate, 7);
         else if (sub.billingCycle === 'MONTHLY') nextDate = addMonths(nextDate, 1);
         else if (sub.billingCycle === 'QUARTERLY') nextDate = addMonths(nextDate, 3);
         else if (sub.billingCycle === 'SEMI_ANNUAL') nextDate = addMonths(nextDate, 6);
         else if (sub.billingCycle === 'ANNUAL') nextDate = addYears(nextDate, 1);
      }

      await prisma.$transaction(async (tx) => {
         // 2. Acuñar Transacción real (La salida de dinero contable)
         const newTransaction = await tx.transaction.create({
            data: {
               workspaceId: sub.workspaceId,
               type: 'EXPENSE',
               amount: sub.amount,
               currency: sub.currency,
               categoryId: sub.categoryId,
               paymentMethodId: sub.paymentMethodId,
               description: `Suscripción - ${sub.name}`,
               notes: 'Cargo Automático (FinTrack CronJob)',
               date: new Date(),
               createdById: sub.workspace.ownerId, // Forzamos al owner a ser el autor para auditoría
               status: 'CONFIRMED'
            }
         });

         // 3. Crear Historial de la Aplicación de Suscripciones (Módulo 3)
         await tx.subscriptionPayment.create({
            data: {
               subscriptionId: sub.id,
               transactionId: newTransaction.id,
               amount: sub.amount,
               currency: sub.currency,
               billingDate: new Date(),
               status: 'PAID'
            }
         });

         // 4. Mover la fecha límite de la Suscripción
         await tx.subscription.update({
            where: { id: sub.id },
            data: { nextBillingDate: nextDate }
         });
      });

      processedCount++;
    } catch (e) {
      console.error(`Error procesando cobro recurrente de sub ${sub.id}:`, e);
      // Falla ruidosa y salto pero no bloqueamos las demás suscripciones
    }
  }

  return ok({
    message: "Barrido contable de servidor finalizado",
    processed: processedCount,
    totalDue: dueSubscriptions.length
  });
};
