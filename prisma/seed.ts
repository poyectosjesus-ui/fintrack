import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    // Ingresos
    { name: "Salario", type: TransactionType.INGRESO, color: "#10b981", icon: "briefcase" },
    { name: "Freelance", type: TransactionType.INGRESO, color: "#06b6d4", icon: "laptop" },
    { name: "Inversiones", type: TransactionType.INGRESO, color: "#8b5cf6", icon: "trending-up" },
    { name: "Otros Ingresos", type: TransactionType.INGRESO, color: "#f59e0b", icon: "plus-circle" },
    // Gastos
    { name: "Alimentación", type: TransactionType.GASTO, color: "#ef4444", icon: "utensils" },
    { name: "Transporte", type: TransactionType.GASTO, color: "#f97316", icon: "car" },
    { name: "Servicios", type: TransactionType.GASTO, color: "#ec4899", icon: "zap" },
    { name: "Entretenimiento", type: TransactionType.GASTO, color: "#a855f7", icon: "film" },
    { name: "Salud", type: TransactionType.GASTO, color: "#14b8a6", icon: "heart" },
    { name: "Ropa", type: TransactionType.GASTO, color: "#84cc16", icon: "shopping-bag" },
    { name: "Educación", type: TransactionType.GASTO, color: "#3b82f6", icon: "book" },
    { name: "Otros Gastos", type: TransactionType.GASTO, color: "#6b7280", icon: "more-horizontal" },
  ];

  console.log("🌱 Sembrando categorías...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  // Sample transactions for the last 4 weeks
  const now = new Date();
  const salarioId = (await prisma.category.findUnique({ where: { name: "Salario" } }))!.id;
  const freelanceId = (await prisma.category.findUnique({ where: { name: "Freelance" } }))!.id;
  const alimentacionId = (await prisma.category.findUnique({ where: { name: "Alimentación" } }))!.id;
  const transporteId = (await prisma.category.findUnique({ where: { name: "Transporte" } }))!.id;
  const serviciosId = (await prisma.category.findUnique({ where: { name: "Servicios" } }))!.id;
  const entretId = (await prisma.category.findUnique({ where: { name: "Entretenimiento" } }))!.id;

  const sampleTransactions = [
    // Semana 1 (hace 3 semanas)
    { amount: 8500, description: "Salario quincenal", type: TransactionType.INGRESO, categoryId: salarioId, date: new Date(now.getTime() - 21 * 86400000) },
    { amount: 320, description: "Súper semanal", type: TransactionType.GASTO, categoryId: alimentacionId, date: new Date(now.getTime() - 20 * 86400000) },
    { amount: 150, description: "Transporte semana", type: TransactionType.GASTO, categoryId: transporteId, date: new Date(now.getTime() - 19 * 86400000) },
    { amount: 1200, description: "Proyecto web freelance", type: TransactionType.INGRESO, categoryId: freelanceId, date: new Date(now.getTime() - 18 * 86400000) },
    { amount: 200, description: "Netflix + Spotify", type: TransactionType.GASTO, categoryId: serviciosId, date: new Date(now.getTime() - 18 * 86400000) },
    // Semana 2 (hace 2 semanas)
    { amount: 450, description: "Restaurantes", type: TransactionType.GASTO, categoryId: alimentacionId, date: new Date(now.getTime() - 14 * 86400000) },
    { amount: 800, description: "Consultoría extra", type: TransactionType.INGRESO, categoryId: freelanceId, date: new Date(now.getTime() - 13 * 86400000) },
    { amount: 180, description: "Cine y salidas", type: TransactionType.GASTO, categoryId: entretId, date: new Date(now.getTime() - 12 * 86400000) },
    { amount: 130, description: "Gasolina", type: TransactionType.GASTO, categoryId: transporteId, date: new Date(now.getTime() - 11 * 86400000) },
    { amount: 8500, description: "Salario quincenal", type: TransactionType.INGRESO, categoryId: salarioId, date: new Date(now.getTime() - 10 * 86400000) },
    // Semana 3 (hace 1 semana)
    { amount: 380, description: "Súper semanal", type: TransactionType.GASTO, categoryId: alimentacionId, date: new Date(now.getTime() - 7 * 86400000) },
    { amount: 160, description: "Transporte semana", type: TransactionType.GASTO, categoryId: transporteId, date: new Date(now.getTime() - 6 * 86400000) },
    { amount: 600, description: "App móvil freelance", type: TransactionType.INGRESO, categoryId: freelanceId, date: new Date(now.getTime() - 5 * 86400000) },
    { amount: 350, description: "Electricidad + agua", type: TransactionType.GASTO, categoryId: serviciosId, date: new Date(now.getTime() - 4 * 86400000) },
    // Esta semana
    { amount: 420, description: "Súper + antojo", type: TransactionType.GASTO, categoryId: alimentacionId, date: new Date(now.getTime() - 2 * 86400000) },
    { amount: 200, description: "Concierto", type: TransactionType.GASTO, categoryId: entretId, date: new Date(now.getTime() - 1 * 86400000) },
    { amount: 2000, description: "Bono proyecto", type: TransactionType.INGRESO, categoryId: freelanceId, date: new Date() },
  ];

  console.log("🌱 Sembrando transacciones de ejemplo...");
  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log("✅ Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
