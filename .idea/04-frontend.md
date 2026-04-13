# 04 — Frontend

> Framework: **Next.js 16** (App Router) · UI: **Tailwind CSS + Shadcn/ui** · Lenguaje: **TypeScript**

---

## 🗂️ Estructura de Carpetas

```
src/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Grupo de rutas — sin navbar
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── invite/[code]/page.tsx
│   │
│   ├── (dashboard)/              # Grupo de rutas — con navbar
│   │   ├── layout.tsx            # Layout con sidebar/navbar
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── gastos/
│   │   │   ├── page.tsx          # Lista de gastos
│   │   │   └── nuevo/page.tsx    # Formulario nuevo gasto
│   │   ├── ingresos/
│   │   │   ├── page.tsx
│   │   │   └── nuevo/page.tsx
│   │   ├── recurrentes/page.tsx  # Suscripciones y pagos fijos
│   │   ├── metas/
│   │   │   ├── page.tsx          # Lista de metas
│   │   │   └── [id]/page.tsx     # Detalle de una meta
│   │   ├── reportes/page.tsx     # Reportes y gráficas
│   │   ├── familia/page.tsx      # Gestión del grupo familiar
│   │   └── ajustes/page.tsx      # Configuración de cuenta
│   │
│   ├── api/                      # API Routes (ver backend.md)
│   └── layout.tsx                # Root layout (fuentes, providers)
│
├── components/
│   ├── ui/                       # Componentes base (Shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── dashboard/
│   │   ├── SummaryCards.tsx      # KPIs: balance, ingresos, gastos
│   │   ├── RecentTransactions.tsx
│   │   ├── UpcomingPayments.tsx
│   │   └── GoalsWidget.tsx
│   │
│   ├── expenses/
│   │   ├── ExpenseForm.tsx       # Formulario crear/editar gasto
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseFilters.tsx
│   │   └── ExpenseCard.tsx
│   │
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalProgressBar.tsx
│   │
│   └── charts/
│       ├── SpendingByCategory.tsx  # Pie chart
│       ├── IncomeVsExpense.tsx     # Bar chart
│       └── BalanceTrend.tsx        # Area chart
│
├── hooks/
│   ├── useExpenses.ts
│   ├── useIncomes.ts
│   ├── useFamily.ts
│   ├── useGoals.ts
│   └── useNotifications.ts
│
├── lib/
│   ├── prisma.ts                 # Singleton Prisma Client
│   ├── auth.ts                   # Config NextAuth
│   ├── validations.ts            # Schemas Zod
│   └── utils.ts                  # Helpers (formatCurrency, etc.)
│
└── types/
    ├── expense.ts
    ├── income.ts
    ├── family.ts
    └── index.ts                  # Re-exports
```

---

## 📱 Páginas y Pantallas

### Dashboard `/`
- Tarjetas KPI: Balance total, Ingresos del período, Gastos del período
- Selector de período: Esta semana / Este mes / Esta quincena
- Últimas 5 transacciones
- Próximos pagos (próximos 7 días)
- Progreso de metas activas

### Gastos `/gastos`
- Listado con filtros: fecha, categoría, método de pago, miembro
- Búsqueda por descripción
- Botón flotante `+` (mobile-first)
- Formulario en modal o página `/gastos/nuevo`

### Ingresos `/ingresos`
- Similar a gastos, filtrado por tipo de ingreso
- Cada miembro puede ver los ingresos de la familia

### Recurrentes `/recurrentes`
- Cards por suscripción/pago fijo
- Estado: activo/inactivo
- Próxima fecha de cobro
- Frecuencia visual (diaria, mensual, etc.)

### Metas `/metas`
- Cards con barra de progreso
- `% completado`, monto restante, días restantes
- Botón para agregar aportación a una meta

### Reportes `/reportes`
- Selector de período (semana / mes / año)
- Pie chart: gastos por categoría
- Bar chart: ingresos vs gastos por período
- Tabla exportable (CSV/PDF)
- Filtro por miembro

### Familia `/familia`
- Lista de miembros con avatar, nombre y rol
- Botón de invitar (genera código o envía email)
- Revocar acceso a un miembro
- Cambiar moneda del grupo

---

## 🎨 Design System

### Paleta de Colores (propuesta dark mode)
```css
--color-bg:       #0a0e1a   /* Fondo principal */
--color-surface:  #111827   /* Tarjetas */
--color-income:   #10b981   /* Verde — ingresos */
--color-expense:  #f43f5e   /* Rojo — gastos */
--color-primary:  #6366f1   /* Indigo — acción */
--color-warning:  #f59e0b   /* Naranja — alertas */
```

### Tipografía
- **Inter** (Google Fonts) — todo el texto
- Pesos: 400 (body), 500 (labels), 600 (subtítulos), 700/800 (títulos), 

### Componentes Clave Shadcn/ui
- `Sheet` — menú lateral en mobile
- `Dialog` — modales de formulario
- `Command` — búsqueda avanzada
- `Calendar` — selector de fechas
- `Progress` — barras de progreso de metas
- `Toast` — notificaciones en pantalla

---

## 📲 Mobile-First

- Diseño pensado primero para **320px** (mobile)
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Navegación inferior en mobile, sidebar en desktop
- Touch targets mínimo **44x44px**
- Gestos: swipe para eliminar transacciones (opcional)

---

## 🔄 Data Fetching

Se usa **SWR** para caché y revalidación:

```typescript
// Ejemplo: hook de gastos
const { data, error, mutate } = useSWR(
  `/api/expenses?familyId=${familyId}&period=${period}`,
  fetcher
)
```

- Revalidación automática al volver a la app
- Optimistic updates en formularios
- Manejo de estados: `loading`, `error`, `empty`
