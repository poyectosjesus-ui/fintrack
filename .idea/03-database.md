# 03 — Modelo de Base de Datos

> Motor: **PostgreSQL** · ORM: **Prisma 7**

---

## Diagrama de Relaciones (ERD simplificado)

```
users ──────────┬──── family_members ──── families
                │                              │
                └──── expenses                 ├──── payment_methods
                └──── incomes                  ├──── recurring_transactions
                └──── notifications            ├──── savings_goals
                                               └──── categories (sistema)
```

---

## 📋 Tablas

### `users` — Usuarios del sistema

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | ID único |
| `email` | String | | ✓ | Único, para login |
| `name` | String | | ✓ | Nombre del usuario |
| `passwordHash` | String | | | Bcrypt hash |
| `image` | String | | | URL del avatar |
| `createdAt` | DateTime | | ✓ | Fecha de registro |
| `updatedAt` | DateTime | | ✓ | Última actualización |

---

### `families` — Grupos familiares

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | ID del grupo |
| `name` | String | | ✓ | Nombre de la familia |
| `ownerId` | UUID (FK) | | ✓ | → `users.id` (creador) |
| `inviteCode` | String | | | Código único para invitar |
| `currency` | String | | | Default: `'MXN'` |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `family_members` — Membresía y roles

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `userId` | UUID (FK) | | ✓ | → `users.id` |
| `role` | Enum | | ✓ | `OWNER`, `ADMIN`, `MEMBER` |
| `joinedAt` | DateTime | | ✓ | Fecha de ingreso |

> **Constraint**: `UNIQUE(familyId, userId)` — un usuario no puede estar dos veces en la misma familia

---

### `categories` — Categorías de gasto/ingreso

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `name` | String | | ✓ | Ej: `Alimentos`, `Transporte` |
| `icon` | String | | | Emoji o nombre de ícono |
| `color` | String | | | Color hexadecimal |
| `type` | Enum | | ✓ | `EXPENSE` o `INCOME` |
| `isSystem` | Boolean | | | `true` = categoría predeterminada |

---

### `payment_methods` — Medios de pago

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `type` | Enum | | ✓ | `CREDIT_CARD`, `DEBIT_CARD`, `CASH`, `TRANSFER` |
| `alias` | String | | ✓ | Ej: `Visa Personal`, `Efectivo` |
| `last4` | String | | | Últimos 4 dígitos (solo tarjetas) |
| `issuer` | String | | | Banco emisor |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `expenses` — Gastos

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `userId` | UUID (FK) | | ✓ | → `users.id` (quién lo registró) |
| `amount` | Decimal | | ✓ | Monto del gasto |
| `description` | String | | ✓ | Descripción breve |
| `categoryId` | UUID (FK) | | ✓ | → `categories.id` |
| `paymentMethodId` | UUID (FK) | | | → `payment_methods.id` |
| `date` | Date | | ✓ | Fecha del gasto |
| `tags` | String[] | | | Etiquetas opcionales |
| `recurringTransactionId` | UUID (FK) | | | → `recurring_transactions.id` |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `incomes` — Ingresos

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `userId` | UUID (FK) | | ✓ | → `users.id` |
| `amount` | Decimal | | ✓ | Monto del ingreso |
| `description` | String | | | Descripción |
| `incomeType` | Enum | | | `SALARY`, `BONUS`, `GIFT`, `OTHER` |
| `date` | Date | | ✓ | Fecha del ingreso |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `recurring_transactions` — Pagos y suscripciones recurrentes

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `name` | String | | ✓ | Ej: `Netflix`, `Renta` |
| `amount` | Decimal | | ✓ | Monto |
| `frequency` | Enum | | ✓ | `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL` |
| `dueDate` | Int | | | Día del mes o semana |
| `categoryId` | UUID (FK) | | | → `categories.id` |
| `paymentMethodId` | UUID (FK) | | | → `payment_methods.id` |
| `isActive` | Boolean | | | Default: `true` |
| `startDate` | Date | | | Inicio de la recurrencia |
| `endDate` | Date | | | Fin (opcional) |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `savings_goals` — Metas de ahorro

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `familyId` | UUID (FK) | | ✓ | → `families.id` |
| `name` | String | | ✓ | Ej: `Vacaciones Cancún` |
| `targetAmount` | Decimal | | ✓ | Monto objetivo |
| `currentAmount` | Decimal | | | Actual acumulado (default: 0) |
| `dueDate` | Date | | | Fecha límite |
| `description` | String | | | Descripción de la meta |
| `icon` | String | | | Emoji representativo |
| `priority` | Enum | | | `LOW`, `MEDIUM`, `HIGH` |
| `createdAt` | DateTime | | ✓ | |
| `updatedAt` | DateTime | | ✓ | |

---

### `notifications` — Notificaciones del sistema

| Campo | Tipo | PK | NN | Descripción |
|-------|------|----|----|-------------|
| `id` | UUID | ✓ | ✓ | |
| `userId` | UUID (FK) | | ✓ | → `users.id` (destinatario) |
| `type` | Enum | | ✓ | `PAYMENT_DUE`, `GOAL_REACHED`, `INVITE`, `SYSTEM` |
| `title` | String | | ✓ | Título de la notificación |
| `message` | String | | ✓ | Mensaje completo |
| `read` | Boolean | | | Default: `false` |
| `relatedId` | UUID | | | Referencia a gasto, meta, etc. |
| `createdAt` | DateTime | | ✓ | |

---

## 🔑 Enums del Sistema

```prisma
enum MemberRole      { OWNER   ADMIN   MEMBER }
enum CategoryType    { EXPENSE INCOME }
enum PaymentType     { CREDIT_CARD  DEBIT_CARD  CASH  TRANSFER }
enum IncomeType      { SALARY  BONUS  GIFT  OTHER }
enum Frequency       { DAILY  WEEKLY  MONTHLY  QUARTERLY  SEMI_ANNUAL  ANNUAL }
enum GoalPriority    { LOW    MEDIUM  HIGH }
enum NotificationType{ PAYMENT_DUE  GOAL_REACHED  INVITE  SYSTEM }
```

---

## 📝 Notas de Implementación

- Todos los `id` son **UUID** (no autoincrement), generados con `cuid()` o `uuid()` en Prisma
- Los datos sensibles (contraseñas) se almacenan **hasheados con bcrypt**, nunca en texto plano
- Las tarjetas guardan **solo los últimos 4 dígitos** — sin información sensible real
- Las `categories` con `isSystem = true` son las predeterminadas del sistema y no se pueden eliminar
