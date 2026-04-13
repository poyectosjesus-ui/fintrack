import "dotenv/config";
import {
  PrismaClient,
  TransactionType,
  TransactionStatus,
  CategoryType,
  CategoryScope,
  MemberRole,
  PaymentMethodType,
  PaymentProvider,
  SubscriptionCategory,
  BillingCycle,
  SubscriptionStatus,
  BudgetPeriod,
  SavingsGoalType,
  GoalPriority,
  WorkspacePlan,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  console.log("🌱 Iniciando seed v2...\n");

  // ─── 1. Usuarios ─────────────────────────────────────────────
  console.log("👤 Creando usuarios...");
  const jesus = await prisma.user.upsert({
    where: { email: "jesus@fintrack.app" },
    update: {},
    create: {
      email: "jesus@fintrack.app",
      name: "Jesús Ruiz",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jesus",
      locale: "es-MX",
      timezone: "America/Mexico_City",
      onboardingDone: true,
    },
  });

  const sofia = await prisma.user.upsert({
    where: { email: "sofia@fintrack.app" },
    update: {},
    create: {
      email: "sofia@fintrack.app",
      name: "Sofía García",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
      locale: "es-MX",
      timezone: "America/Mexico_City",
      onboardingDone: true,
    },
  });
  console.log(`   ✓ ${jesus.name}, ${sofia.name}`);

  // ─── 2. Workspace ─────────────────────────────────────────────
  console.log("🏠 Creando workspace...");
  const ws = await prisma.workspace.upsert({
    where: { slug: "casa-ruiz-garcia" },
    update: {},
    create: {
      name: "Casa Ruiz García",
      slug: "casa-ruiz-garcia",
      currency: "MXN",
      plan: WorkspacePlan.PRO,
      memberLimit: 10,
      ownerId: jesus.id,
    },
  });
  console.log(`   ✓ ${ws.name}`);

  // ─── 3. Miembros ──────────────────────────────────────────────
  const memberJesus = await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: ws.id, userId: jesus.id } },
    update: {},
    create: {
      workspaceId: ws.id,
      userId: jesus.id,
      role: MemberRole.OWNER,
      canCreateExpense: true,
      canCreateIncome: true,
      canManageSubscriptions: true,
      canManageBudgets: true,
      canManageMembers: true,
    },
  });

  const memberSofia = await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: ws.id, userId: sofia.id } },
    update: {},
    create: {
      workspaceId: ws.id,
      userId: sofia.id,
      role: MemberRole.ADMIN,
      canCreateExpense: true,
      canCreateIncome: true,
      canManageSubscriptions: true,
      canManageBudgets: false,
      canManageMembers: false,
    },
  });
  console.log(`   ✓ Miembros: ${jesus.name} (OWNER), ${sofia.name} (ADMIN)`);

  // ─── 4. Categorías del sistema (árbol jerárquico) ────────────
  console.log("🗂️  Creando árbol de categorías...");

  const createCat = (data: {
    name: string; type: CategoryType; icon: string; color: string;
    parentId?: string; sortOrder?: number;
  }) => prisma.category.create({
    data: { ...data, scope: CategoryScope.SYSTEM, sortOrder: data.sortOrder ?? 0 },
  });

  // ── Ingresos ──
  const catIngresos = await createCat({ name: "Ingresos", type: CategoryType.INCOME, icon: "📥", color: "#10b981", sortOrder: 0 });
  const catSalario = await createCat({ name: "Salario", type: CategoryType.INCOME, icon: "💼", color: "#10b981", parentId: catIngresos.id, sortOrder: 1 });
  const catFreelance = await createCat({ name: "Freelance", type: CategoryType.INCOME, icon: "🖥️", color: "#06b6d4", parentId: catIngresos.id, sortOrder: 2 });
  const catInversiones = await createCat({ name: "Inversiones", type: CategoryType.INCOME, icon: "📈", color: "#8b5cf6", parentId: catIngresos.id, sortOrder: 3 });
  const catBono = await createCat({ name: "Bono / Extra", type: CategoryType.INCOME, icon: "🎁", color: "#f59e0b", parentId: catIngresos.id, sortOrder: 4 });
  await createCat({ name: "Otros Ingresos", type: CategoryType.INCOME, icon: "💡", color: "#6b7280", parentId: catIngresos.id, sortOrder: 5 });

  // ── Hogar ──
  const catHogar = await createCat({ name: "Hogar", type: CategoryType.EXPENSE, icon: "🏠", color: "#3b82f6", sortOrder: 10 });
  const catRenta = await createCat({ name: "Renta / Hipoteca", type: CategoryType.EXPENSE, icon: "🏡", color: "#3b82f6", parentId: catHogar.id, sortOrder: 1 });
  await createCat({ name: "Agua, Luz, Gas", type: CategoryType.EXPENSE, icon: "⚡", color: "#f59e0b", parentId: catHogar.id, sortOrder: 2 });
  const catInternet = await createCat({ name: "Internet / Teléfono", type: CategoryType.EXPENSE, icon: "📡", color: "#06b6d4", parentId: catHogar.id, sortOrder: 3 });
  await createCat({ name: "Mantenimiento", type: CategoryType.EXPENSE, icon: "🔧", color: "#6b7280", parentId: catHogar.id, sortOrder: 4 });

  // ── Alimentación ──
  const catAlimentos = await createCat({ name: "Alimentación", type: CategoryType.EXPENSE, icon: "🛒", color: "#ef4444", sortOrder: 20 });
  const catDespensa = await createCat({ name: "Despensa / Súper", type: CategoryType.EXPENSE, icon: "🛒", color: "#ef4444", parentId: catAlimentos.id, sortOrder: 1 });
  const catRestaurantes = await createCat({ name: "Restaurantes", type: CategoryType.EXPENSE, icon: "🍽️", color: "#f97316", parentId: catAlimentos.id, sortOrder: 2 });
  await createCat({ name: "Café / Snacks", type: CategoryType.EXPENSE, icon: "☕", color: "#92400e", parentId: catAlimentos.id, sortOrder: 3 });

  // ── Transporte ──
  const catTransporte = await createCat({ name: "Transporte", type: CategoryType.EXPENSE, icon: "🚗", color: "#f97316", sortOrder: 30 });
  await createCat({ name: "Gasolina", type: CategoryType.EXPENSE, icon: "⛽", color: "#f97316", parentId: catTransporte.id, sortOrder: 1 });
  await createCat({ name: "Uber / Cabify", type: CategoryType.EXPENSE, icon: "🚕", color: "#1d4ed8", parentId: catTransporte.id, sortOrder: 2 });
  await createCat({ name: "Transporte público", type: CategoryType.EXPENSE, icon: "🚌", color: "#6b7280", parentId: catTransporte.id, sortOrder: 3 });
  await createCat({ name: "Estacionamiento", type: CategoryType.EXPENSE, icon: "🅿️", color: "#6b7280", parentId: catTransporte.id, sortOrder: 4 });

  // ── Trabajo & Productividad ──
  const catTrabajo = await createCat({ name: "Trabajo & Productividad", type: CategoryType.EXPENSE, icon: "💻", color: "#6366f1", sortOrder: 40 });
  const catSaaS = await createCat({ name: "Herramientas SaaS", type: CategoryType.EXPENSE, icon: "🛠️", color: "#6366f1", parentId: catTrabajo.id, sortOrder: 1 });
  await createCat({ name: "Equipamiento / Hardware", type: CategoryType.EXPENSE, icon: "⌨️", color: "#6366f1", parentId: catTrabajo.id, sortOrder: 2 });
  await createCat({ name: "Capacitación / Cursos", type: CategoryType.EXPENSE, icon: "📚", color: "#8b5cf6", parentId: catTrabajo.id, sortOrder: 3 });
  await createCat({ name: "Coworking", type: CategoryType.EXPENSE, icon: "🏢", color: "#6366f1", parentId: catTrabajo.id, sortOrder: 4 });

  // ── Entretenimiento ──
  const catEntret = await createCat({ name: "Entretenimiento", type: CategoryType.EXPENSE, icon: "🎭", color: "#a855f7", sortOrder: 50 });
  const catStreaming = await createCat({ name: "Streaming", type: CategoryType.EXPENSE, icon: "📺", color: "#a855f7", parentId: catEntret.id, sortOrder: 1 });
  const catMusica = await createCat({ name: "Música", type: CategoryType.EXPENSE, icon: "🎵", color: "#ec4899", parentId: catEntret.id, sortOrder: 2 });
  await createCat({ name: "Videojuegos / Gaming", type: CategoryType.EXPENSE, icon: "🎮", color: "#7c3aed", parentId: catEntret.id, sortOrder: 3 });
  await createCat({ name: "Salidas / Eventos", type: CategoryType.EXPENSE, icon: "🎉", color: "#db2777", parentId: catEntret.id, sortOrder: 4 });
  await createCat({ name: "Cine / Teatro", type: CategoryType.EXPENSE, icon: "🎬", color: "#9333ea", parentId: catEntret.id, sortOrder: 5 });

  // ── Salud & Bienestar ──
  const catSalud = await createCat({ name: "Salud & Bienestar", type: CategoryType.EXPENSE, icon: "💚", color: "#14b8a6", sortOrder: 60 });
  await createCat({ name: "Médico / Farmacia", type: CategoryType.EXPENSE, icon: "🏥", color: "#14b8a6", parentId: catSalud.id, sortOrder: 1 });
  await createCat({ name: "Gimnasio / Deporte", type: CategoryType.EXPENSE, icon: "🏋️", color: "#10b981", parentId: catSalud.id, sortOrder: 2 });
  await createCat({ name: "Psicología / Terapia", type: CategoryType.EXPENSE, icon: "🧠", color: "#06b6d4", parentId: catSalud.id, sortOrder: 3 });
  await createCat({ name: "Wellness / Spa", type: CategoryType.EXPENSE, icon: "🧘", color: "#84cc16", parentId: catSalud.id, sortOrder: 4 });

  // ── Otras categorías ──
  const catRopa = await createCat({ name: "Ropa & Personal", type: CategoryType.EXPENSE, icon: "👗", color: "#f43f5e", sortOrder: 70 });
  await createCat({ name: "Mascotas", type: CategoryType.EXPENSE, icon: "🐾", color: "#fb923c", sortOrder: 80 });
  await createCat({ name: "Educación", type: CategoryType.EXPENSE, icon: "📚", color: "#3b82f6", sortOrder: 90 });
  const catViajes = await createCat({ name: "Viajes & Vacaciones", type: CategoryType.EXPENSE, icon: "✈️", color: "#0ea5e9", sortOrder: 100 });
  await createCat({ name: "Deudas & Préstamos", type: CategoryType.EXPENSE, icon: "💳", color: "#dc2626", sortOrder: 110 });
  await createCat({ name: "Regalos & Donaciones", type: CategoryType.EXPENSE, icon: "🎁", color: "#ec4899", sortOrder: 120 });
  await createCat({ name: "IA & Herramientas AI", type: CategoryType.EXPENSE, icon: "🤖", color: "#8b5cf6", parentId: catTrabajo.id, sortOrder: 5 });

  console.log("   ✓ 35+ categorías en árbol jerárquico");

  // ─── 5. Métodos de Pago ───────────────────────────────────────
  console.log("💳 Creando métodos de pago...");

  const pmDebito = await prisma.paymentMethod.create({
    data: {
      workspaceId: ws.id,
      createdById: jesus.id,
      type: PaymentMethodType.DEBIT_CARD,
      provider: PaymentProvider.BBVA,
      alias: "BBVA Débito",
      last4: "4521",
      color: "#004a97",
      isDefault: true,
    },
  });

  const pmCredito = await prisma.paymentMethod.create({
    data: {
      workspaceId: ws.id,
      createdById: jesus.id,
      type: PaymentMethodType.CREDIT_CARD,
      provider: PaymentProvider.VISA,
      alias: "Visa Azul",
      last4: "8834",
      color: "#1a1f71",
    },
  });

  const pmMercadoPago = await prisma.paymentMethod.create({
    data: {
      workspaceId: ws.id,
      createdById: sofia.id,
      type: PaymentMethodType.DIGITAL_WALLET,
      provider: PaymentProvider.MERCADO_PAGO,
      alias: "Mercado Pago",
      color: "#00b1ea",
    },
  });

  const pmEfectivo = await prisma.paymentMethod.create({
    data: {
      workspaceId: ws.id,
      createdById: jesus.id,
      type: PaymentMethodType.CASH,
      provider: PaymentProvider.OTHER,
      alias: "Efectivo",
      color: "#16a34a",
    },
  });
  console.log("   ✓ 4 métodos de pago");

  // ─── 6. Suscripciones ─────────────────────────────────────────
  console.log("📺 Creando suscripciones...");

  const subscriptions = [
    {
      name: "Netflix",
      subCategory: SubscriptionCategory.STREAMING,
      billingCycle: BillingCycle.MONTHLY,
      amount: 199,
      currency: "MXN",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(12),
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      categoryId: catStreaming.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "Spotify",
      subCategory: SubscriptionCategory.MUSIC,
      billingCycle: BillingCycle.MONTHLY,
      amount: 99,
      currency: "MXN",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(5),
      categoryId: catMusica.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "ChatGPT Plus",
      subCategory: SubscriptionCategory.AI_TOOL,
      billingCycle: BillingCycle.MONTHLY,
      amount: 20,
      currency: "USD",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(8),
      websiteUrl: "https://chat.openai.com",
      categoryId: catSaaS.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "GitHub Copilot",
      subCategory: SubscriptionCategory.WORK_TOOL,
      billingCycle: BillingCycle.MONTHLY,
      amount: 10,
      currency: "USD",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(22),
      websiteUrl: "https://github.com/features/copilot",
      categoryId: catSaaS.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "Notion",
      subCategory: SubscriptionCategory.PRODUCTIVITY,
      billingCycle: BillingCycle.ANNUAL,
      amount: 960,
      currency: "MXN",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(180),
      categoryId: catSaaS.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "Disney+",
      subCategory: SubscriptionCategory.STREAMING,
      billingCycle: BillingCycle.MONTHLY,
      amount: 149,
      currency: "MXN",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(18),
      categoryId: catStreaming.id,
      paymentMethodId: pmMercadoPago.id,
    },
    {
      name: "iCloud 200GB",
      subCategory: SubscriptionCategory.STORAGE,
      billingCycle: BillingCycle.MONTHLY,
      amount: 35,
      currency: "MXN",
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: daysFromNow(3),
      categoryId: catSaaS.id,
      paymentMethodId: pmCredito.id,
    },
    {
      name: "Figma",
      subCategory: SubscriptionCategory.WORK_TOOL,
      billingCycle: BillingCycle.MONTHLY,
      amount: 15,
      currency: "USD",
      status: SubscriptionStatus.PAUSED,
      nextBillingDate: daysFromNow(30),
      categoryId: catSaaS.id,
      paymentMethodId: pmCredito.id,
    },
  ];

  const createdSubs = [];
  for (const sub of subscriptions) {
    const s = await prisma.subscription.create({
      data: {
        workspaceId: ws.id,
        sharedWithAll: true,
        ...sub,
      },
    });
    createdSubs.push(s);
  }
  console.log(`   ✓ ${createdSubs.length} suscripciones (Netflix, Spotify, ChatGPT, Copilot, Notion...)`);

  // ─── 7. Transacciones ─────────────────────────────────────────
  console.log("💸 Creando transacciones de las últimas 6 semanas...");

  const txData = [
    // — Semana -4 —
    { type: TransactionType.INCOME,  amount: 18000, description: "Salario quincenal",        categoryId: catSalario.id,     createdById: jesus.id, date: daysAgo(42), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 8500,  description: "Renta departamento",       categoryId: catRenta.id,       createdById: jesus.id, date: daysAgo(40), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 1250,  description: "Súper semanal",            categoryId: catDespensa.id,    createdById: sofia.id, date: daysAgo(39), paymentMethodId: pmMercadoPago.id },
    { type: TransactionType.EXPENSE, amount: 380,   description: "Gasolina",                  categoryId: catTransporte.id,  createdById: jesus.id, date: daysAgo(38), paymentMethodId: pmDebito.id },
    { type: TransactionType.INCOME,  amount: 5500,  description: "Proyecto web freelance",   categoryId: catFreelance.id,   createdById: jesus.id, date: daysAgo(37), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 650,   description: "Restaurante cumpleaños",   categoryId: catRestaurantes.id,createdById: sofia.id, date: daysAgo(36), paymentMethodId: pmCredito.id },

    // — Semana -3 —
    { type: TransactionType.INCOME,  amount: 18000, description: "Salario quincenal",        categoryId: catSalario.id,     createdById: jesus.id, date: daysAgo(28), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 1100,  description: "Súper + frutas",           categoryId: catDespensa.id,    createdById: sofia.id, date: daysAgo(26), paymentMethodId: pmMercadoPago.id },
    { type: TransactionType.EXPENSE, amount: 199,   description: "Netflix",                  categoryId: catStreaming.id,   createdById: jesus.id, date: daysAgo(25), paymentMethodId: pmCredito.id, subscriptionId: createdSubs[0].id },
    { type: TransactionType.EXPENSE, amount: 99,    description: "Spotify",                  categoryId: catMusica.id,      createdById: jesus.id, date: daysAgo(25), paymentMethodId: pmCredito.id, subscriptionId: createdSubs[1].id },
    { type: TransactionType.EXPENSE, amount: 420,   description: "Farmacia y medicamentos",  categoryId: catSalud.id,       createdById: sofia.id, date: daysAgo(24), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 280,   description: "Uber al aeropuerto",       categoryId: catTransporte.id,  createdById: jesus.id, date: daysAgo(22), paymentMethodId: pmMercadoPago.id },
    { type: TransactionType.INCOME,  amount: 3200,  description: "Consultoría marketing",    categoryId: catFreelance.id,   createdById: sofia.id, date: daysAgo(21), paymentMethodId: pmDebito.id },

    // — Semana -2 —
    { type: TransactionType.EXPENSE, amount: 450,   description: "Internet Telmex",          categoryId: catInternet.id,    createdById: jesus.id, date: daysAgo(18), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 1400,  description: "Despensa quincenal",       categoryId: catDespensa.id,    createdById: sofia.id, date: daysAgo(15), paymentMethodId: pmDebito.id },
    { type: TransactionType.INCOME,  amount: 18000, description: "Salario quincenal",        categoryId: catSalario.id,     createdById: jesus.id, date: daysAgo(15), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 2800,  description: "Ropa temporada",           categoryId: catRopa.id,        createdById: sofia.id, date: daysAgo(13), paymentMethodId: pmCredito.id },
    { type: TransactionType.EXPENSE, amount: 560,   description: "Cena en restaurante",      categoryId: catRestaurantes.id,createdById: jesus.id, date: daysAgo(12), paymentMethodId: pmCredito.id },
    { type: TransactionType.EXPENSE, amount: 149,   description: "Disney+",                  categoryId: catStreaming.id,   createdById: sofia.id, date: daysAgo(11), paymentMethodId: pmMercadoPago.id, subscriptionId: createdSubs[5].id },
    { type: TransactionType.INCOME,  amount: 7500,  description: "Bono de productividad",    categoryId: catBono.id,        createdById: jesus.id, date: daysAgo(10), paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 900,   description: "Vuelo gdl-mx",             categoryId: catViajes.id,      createdById: jesus.id, date: daysAgo(9),  paymentMethodId: pmCredito.id },

    // — Semana -1 —
    { type: TransactionType.EXPENSE, amount: 35,    description: "iCloud 200GB",             categoryId: catSaaS.id,        createdById: jesus.id, date: daysAgo(7),  paymentMethodId: pmCredito.id, subscriptionId: createdSubs[6].id },
    { type: TransactionType.EXPENSE, amount: 380,   description: "Gasolina",                  categoryId: catTransporte.id,  createdById: jesus.id, date: daysAgo(6),  paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 850,   description: "Súper + limpieza",          categoryId: catDespensa.id,    createdById: sofia.id, date: daysAgo(5),  paymentMethodId: pmMercadoPago.id },
    { type: TransactionType.INCOME,  amount: 4200,  description: "App móvil cliente",        categoryId: catFreelance.id,   createdById: jesus.id, date: daysAgo(4),  paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 320,   description: "Café + trabajo remoto",    categoryId: catRestaurantes.id,createdById: jesus.id, date: daysAgo(3),  paymentMethodId: pmEfectivo.id },
    { type: TransactionType.EXPENSE, amount: 2400,  description: "Mouse + teclado mecánico", categoryId: catTrabajo.id,     createdById: jesus.id, date: daysAgo(2),  paymentMethodId: pmCredito.id },
    { type: TransactionType.INCOME,  amount: 18000, description: "Salario quincenal",        categoryId: catSalario.id,     createdById: jesus.id, date: daysAgo(1),  paymentMethodId: pmDebito.id },
    { type: TransactionType.EXPENSE, amount: 480,   description: "Gym mensualidad x2",      categoryId: catSalud.id,       createdById: sofia.id, date: daysAgo(0),  paymentMethodId: pmDebito.id },
  ];

  const createdTxs = [];
  for (const tx of txData) {
    const created = await prisma.transaction.create({
      data: {
        workspaceId: ws.id,
        status: TransactionStatus.CONFIRMED,
        currency: "MXN",
        tags: [],
        ...tx,
        date: tx.date,
      },
    });
    createdTxs.push(created);
  }
  console.log(`   ✓ ${createdTxs.length} transacciones realistas`);

  // ─── 8. Split de gasto ────────────────────────────────────────
  const cenaTx = createdTxs.find(t => t.description === "Cena en restaurante")!;
  await prisma.transactionSplit.createMany({
    data: [
      { transactionId: cenaTx.id, memberId: memberJesus.id, amount: 280, isPaid: true, paidAt: new Date() },
      { transactionId: cenaTx.id, memberId: memberSofia.id, amount: 280, isPaid: false },
    ],
  });
  console.log("   ✓ Split: 'Cena en restaurante' dividida entre Jesús y Sofía");

  // ─── 9. Presupuestos ─────────────────────────────────────────
  console.log("📊 Creando presupuestos...");
  await prisma.budget.createMany({
    data: [
      { workspaceId: ws.id, categoryId: catAlimentos.id,  amount: 4000, period: BudgetPeriod.MONTHLY, alertAt: 80, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catTransporte.id, amount: 1500, period: BudgetPeriod.MONTHLY, alertAt: 75, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catEntret.id,     amount: 1000, period: BudgetPeriod.MONTHLY, alertAt: 90, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catSalud.id,      amount: 1500, period: BudgetPeriod.MONTHLY, alertAt: 85, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catRopa.id,       amount: 2000, period: BudgetPeriod.MONTHLY, alertAt: 80, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catTrabajo.id,    amount: 3000, period: BudgetPeriod.MONTHLY, alertAt: 70, startDate: new Date(), rollover: false },
      { workspaceId: ws.id, categoryId: catViajes.id,     amount: 5000, period: BudgetPeriod.MONTHLY, alertAt: 80, startDate: new Date(), rollover: false },
    ],
    skipDuplicates: true,
  });
  console.log(`   ✓ 7 presupuestos mensuales`);

  // ─── 10. Metas de Ahorro ─────────────────────────────────────
  console.log("🎯 Creando metas de ahorro...");
  const vacaciones = await prisma.savingsGoal.create({
    data: {
      workspaceId: ws.id,
      name: "Vacaciones Europa 2026",
      type: SavingsGoalType.VACATION,
      icon: "✈️",
      description: "Viaje de 3 semanas por España, Francia e Italia",
      targetAmount: 60000,
      currentAmount: 18500,
      dueDate: new Date("2026-12-01"),
      priority: GoalPriority.HIGH,
      isShared: true,
    },
  });

  const emergencia = await prisma.savingsGoal.create({
    data: {
      workspaceId: ws.id,
      name: "Fondo de Emergencia",
      type: SavingsGoalType.EMERGENCY,
      icon: "🛡️",
      description: "3 meses de gastos cubiertos",
      targetAmount: 80000,
      currentAmount: 35000,
      priority: GoalPriority.HIGH,
      isShared: true,
    },
  });

  await prisma.savingsGoal.create({
    data: {
      workspaceId: ws.id,
      name: "MacBook Pro M4",
      type: SavingsGoalType.TECH,
      icon: "💻",
      description: "Renovar equipo de trabajo",
      targetAmount: 45000,
      currentAmount: 12000,
      dueDate: daysFromNow(120),
      priority: GoalPriority.MEDIUM,
      isShared: false,
    },
  });

  // Aportaciones a metas
  await prisma.savingsContribution.createMany({
    data: [
      { goalId: vacaciones.id, memberId: memberJesus.id, userId: jesus.id, amount: 10000, note: "Primer ahorro del año", date: daysAgo(45) },
      { goalId: vacaciones.id, memberId: memberSofia.id, userId: sofia.id, amount: 8500, note: "Aportación quincenal", date: daysAgo(30) },
      { goalId: emergencia.id, memberId: memberJesus.id, userId: jesus.id, amount: 20000, note: "Base inicial", date: daysAgo(60) },
      { goalId: emergencia.id, memberId: memberSofia.id, userId: sofia.id, amount: 15000, note: "Ahorro mensual", date: daysAgo(30) },
    ],
  });
  console.log("   ✓ 3 metas de ahorro + 4 aportaciones");

  // ─── Resumen ─────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    transactions: await prisma.transaction.count(),
    subscriptions: await prisma.subscription.count(),
    budgets: await prisma.budget.count(),
    goals: await prisma.savingsGoal.count(),
  };

  console.log("\n✅ Seed v2 completado!");
  console.log("─".repeat(40));
  console.log(`   👤 Usuarios:        ${counts.users}`);
  console.log(`   🗂️  Categorías:      ${counts.categories}`);
  console.log(`   💸 Transacciones:   ${counts.transactions}`);
  console.log(`   📺 Suscripciones:   ${counts.subscriptions}`);
  console.log(`   📊 Presupuestos:    ${counts.budgets}`);
  console.log(`   🎯 Metas de ahorro: ${counts.goals}`);
  console.log("─".repeat(40));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
