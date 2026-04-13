import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const budgets = await prisma.budget.findMany();
  console.log('BUDGETS:', budgets);
}
main();
