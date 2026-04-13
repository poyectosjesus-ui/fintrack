# 💰 Finance Tracker

**Análisis de gastos e ingresos por semana y quincena** — construido con Next.js 16, PostgreSQL y Prisma 7.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 |
| UI | React 19 + CSS puro (dark mode) |
| Gráficas | Recharts |
| Fechas | date-fns |
| Lenguaje | TypeScript |

## 📋 Características

- 📊 **Análisis Semanal y Quincenal** — alterna entre vistas de 4 semanas o 4 quincenas
- 💰 **Tarjetas de Resumen** — total de ingresos, gastos, balance y número de transacciones
- 📈 **Gráfica de Barras** — comparación ingresos vs gastos por período
- 🥧 **Gráfica de Pastel** — desglose por categoría del período seleccionado
- 📉 **Área de Tendencia** — evolución del balance a lo largo del tiempo
- 🔖 **Barras de desglose** — ranking de gastos e ingresos por categoría
- 🧾 **Tabla de Transacciones** — CRUD completo con filtros por tipo
- ➕ **Modal de Nueva Transacción** — selección de tipo, monto, categoría, fecha, notas
- ✏️ **Editar / Eliminar** transacciones

## 🛠️ Setup

### 1. Variables de entorno

Edita `.env` con tu cadena de conexión de PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/finance_tracker"
```

### 2. Crear la base de datos

```bash
# En psql o pgAdmin, crea la base de datos:
createdb finance_tracker
# O en psql:
# CREATE DATABASE finance_tracker;
```

### 3. Ejecutar migraciones

```bash
npm run db:migrate
# Cuando te pida nombre de migración, escribe: init
```

### 4. Sembrar datos de ejemplo

```bash
npm run db:seed
```

### 5. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/analytics?periodType=semanal&count=4` | Análisis por períodos |
| GET | `/api/transactions` | Lista transacciones (con filtros) |
| POST | `/api/transactions` | Crear transacción |
| PUT | `/api/transactions/:id` | Actualizar transacción |
| DELETE | `/api/transactions/:id` | Eliminar transacción |
| GET | `/api/categories` | Lista categorías |
| POST | `/api/categories` | Crear categoría |

## 🗂️ Estructura del Proyecto

```
finance-tracker/
├── prisma/
│   ├── schema.prisma      # Modelos: Category, Transaction, Period
│   └── seed.ts            # Datos de ejemplo
├── prisma.config.ts       # Configuración Prisma 7
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/route.ts
│   │   │   ├── categories/route.ts
│   │   │   └── transactions/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── globals.css    # Design system completo
│   │   ├── layout.tsx
│   │   └── page.tsx       # Dashboard principal
│   └── lib/
│       ├── prisma.ts      # Singleton del cliente Prisma
│       └── periods.ts     # Utilidades de períodos semanales/quincenales
└── .env                   # Variables de entorno
```

## 🎨 Design System

- **Dark mode** completo con variables CSS
- **Glassmorphism** en navbar (backdrop-filter blur)
- **Micro-animaciones** en hover de cards y botones
- **Gradientes** y efectos de glow para colores del sistema
- **Responsive** adaptado a móvil

## 📝 Comandos Útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:push      # Sincronizar schema sin migración
npm run db:migrate   # Migración completa con historial
npm run db:seed      # Sembrar datos de ejemplo
npm run db:studio    # Prisma Studio (GUI para la BD)
```
