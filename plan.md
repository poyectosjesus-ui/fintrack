# Plan: Backend Completo — FinTrack Familia v2

## Objetivo

Construir todo el backend de FinTrack desde cero: reemplazar las 3 routes v1
(sin auth, sin tipado, sin validación) con **15 módulos de API** completamente
seguros, tipados y testeados, alineados con el schema Prisma v2 (15 tablas).

---

## Estado Actual

| Qué existe | Estado |
|------------|--------|
| `src/app/api/transactions/route.ts` | ❌ v1 — sin auth, sin Zod, sin workspace |
| `src/app/api/categories/route.ts` | ❌ v1 — sin auth |
| `src/app/api/analytics/route.ts` | ❌ v1 — sin auth, usa tablas viejas |
| `src/lib/prisma.ts` | ✅ Singleton Prisma 7 correcto |
| `src/lib/periods.ts` | ⚠️ Mantener — útil para analytics |

**Dependencias de npm por instalar:**
```bash
npm install next-auth@beta bcryptjs zod
npm install --save-dev vitest @vitest/coverage-v8 vitest-mock-extended @types/bcryptjs
```

---

## ⚠️ User Review Required

> [!IMPORTANT]
> Las 3 API Routes actuales serán **completamente reemplazadas**. El dashboard
> front-end dejará de funcionar temporalmente hasta completar la Fase 4.

> [!WARNING]
> Requiere instalar dependencias antes de comenzar (NextAuth, bcryptjs, zod).

---

## Arquitectura de Archivos Final

```
src/
├── middleware.ts                    ← NUEVO: Protección global de rutas
├── types/
│   ├── next-auth.d.ts              ← NUEVO: Tipos extendidos de sesión
│   └── index.ts                    ← NUEVO: Tipos globales shared
├── lib/
│   ├── prisma.ts                   ← ✅ Ya existe (no modificar)
│   ├── auth.ts                     ← NUEVO: Config NextAuth v5
│   ├── password.ts                 ← NUEVO: bcrypt helpers
│   ├── logger.ts                   ← NUEVO: Logger estructurado
│   ├── env.ts                      ← NUEVO: Validación de env vars
│   ├── rate-limit.ts               ← NUEVO: Rate limiter in-memory
│   └── periods.ts                  ← ✅ Ya existe (mantener)
└── app/
    └── api/
        ├── _lib/                   ← NUEVO: Infraestructura compartida
        │   ├── responses.ts        ← Helpers ok/created/notFound/etc.
        │   ├── errors.ts           ← Clase AppError
        │   ├── handler.ts          ← withHandler() try-catch wrapper
        │   └── authorization.ts    ← requirePermission/requireSameWorkspace
        │
        ├── auth/
        │   ├── [...nextauth]/route.ts   ← Manejador NextAuth
        │   └── register/route.ts        ← POST registro de usuario
        │
        ├── workspaces/
        │   ├── route.ts                 ← GET (mi workspace) + POST (crear)
        │   ├── [id]/route.ts            ← PUT (actualizar) + DELETE
        │   ├── [id]/members/route.ts    ← GET (listar miembros)
        │   ├── [id]/members/[mid]/route.ts  ← PUT rol + DELETE
        │   └── [id]/invite/route.ts     ← POST (generar invitación)
        │
        ├── invitations/
        │   └── [code]/route.ts          ← POST (aceptar invitación)
        │
        ├── categories/
        │   ├── route.ts                 ← GET (árbol) + POST (crear)
        │   └── [id]/route.ts            ← PUT + DELETE
        │
        ├── transactions/
        │   ├── route.ts                 ← GET (list+filtros) + POST (crear)
        │   └── [id]/
        │       ├── route.ts             ← GET + PUT + DELETE
        │       └── splits/route.ts      ← GET + POST splits
        │
        ├── payment-methods/
        │   ├── route.ts                 ← GET + POST
        │   └── [id]/route.ts            ← PUT + DELETE
        │
        ├── subscriptions/
        │   ├── route.ts                 ← GET + POST
        │   └── [id]/
        │       ├── route.ts             ← GET + PUT + DELETE
        │       └── toggle/route.ts      ← POST activar/pausar
        │
        ├── budgets/
        │   ├── route.ts                 ← GET + POST
        │   └── [id]/route.ts            ← PUT + DELETE
        │
        ├── savings/
        │   ├── route.ts                 ← GET goals + POST crear
        │   └── [id]/
        │       ├── route.ts             ← GET + PUT + DELETE
        │       └── contribute/route.ts  ← POST aportación
        │
        ├── notifications/
        │   ├── route.ts                 ← GET lista
        │   ├── [id]/read/route.ts       ← PUT marcar leída
        │   └── read-all/route.ts        ← PUT marcar todas leídas
        │
        └── analytics/
            └── route.ts                 ← GET resumen financiero (refactorizar)
```

---

## Fases de Desarrollo

---

### Fase 1 — Infraestructura Compartida
**Estimado:** ~2h · **Prerequisito de todo lo demás**

#### Archivos a crear

| Archivo | Contenido |
|---------|-----------|
| [NEW] `src/middleware.ts` | Protección de rutas + headers de seguridad |
| [NEW] `src/types/next-auth.d.ts` | Session extendida con workspaceId + role |
| [NEW] `src/types/index.ts` | ApiResponse<T>, PaginatedResponse<T> |
| [NEW] `src/lib/auth.ts` | NextAuth v5 con Credentials provider |
| [NEW] `src/lib/password.ts` | hashPassword, verifyPassword, PasswordSchema |
| [NEW] `src/lib/logger.ts` | Logger JSON + colorizado para dev |
| [NEW] `src/lib/env.ts` | Validación de variables de entorno con Zod |
| [NEW] `src/lib/rate-limit.ts` | Rate limiter in-memory |
| [NEW] `src/app/api/_lib/responses.ts` | ok, created, unauthorized, notFound... |
| [NEW] `src/app/api/_lib/errors.ts` | Clase AppError con factory methods |
| [NEW] `src/app/api/_lib/handler.ts` | withHandler() wrapper |
| [NEW] `src/app/api/_lib/authorization.ts` | requirePermission, requireSameWorkspace |

---

### Fase 2 — Autenticación
**Estimado:** ~2h · **Requiere Fase 1**

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario + crear workspace FREE |
| `ANY` | `/api/auth/[...nextauth]` | Login, logout, session (manejado por NextAuth) |

#### Archivos

| Archivo | Contenido |
|---------|-----------|
| [NEW] `src/app/api/auth/[...nextauth]/route.ts` | Handler NextAuth |
| [NEW] `src/app/api/auth/register/route.ts` | POST con Zod + bcrypt + rate limit |

#### Lógica de registro
```
1. Validar email + password (PasswordSchema)
2. Verificar que email no existe
3. Hash de contraseña (bcrypt 12 rounds)
4. Crear User en BD
5. Crear Workspace FREE (slug auto-generado)
6. Crear WorkspaceMember como OWNER
7. Responder con 201 (sin exponer passwordHash)
```

---

### Fase 3 — Workspaces e Invitaciones
**Estimado:** ~3h · **Requiere Fase 2**

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/workspaces` | Obtener mi workspace con miembros |
| `POST` | `/api/workspaces` | Crear workspace adicional |
| `PUT` | `/api/workspaces/[id]` | Actualizar nombre, moneda |
| `GET` | `/api/workspaces/[id]/members` | Listar miembros con roles |
| `PUT` | `/api/workspaces/[id]/members/[mid]` | Cambiar rol de un miembro |
| `DELETE` | `/api/workspaces/[id]/members/[mid]` | Expulsar miembro |
| `POST` | `/api/workspaces/[id]/invite` | Generar código invitación (8 chars) |
| `POST` | `/api/invitations/[code]` | Aceptar invitación y unirse |

#### Reglas de negocio
- Solo `OWNER` puede eliminar el workspace o expulsar miembros
- Solo `OWNER` o `ADMIN` pueden invitar (según `canManageMembers`)
- El `OWNER` no puede ser expulsado ni cambiar su propio rol
- El código de invitación expira en 7 días
- Un usuario no puede estar en el mismo workspace dos veces

---

### Fase 4 — Core Financiero (Transacciones, Categorías, Métodos de Pago)
**Estimado:** ~4h · **Requiere Fase 2** · _Reactiva el dashboard_

#### Endpoints — Categorías

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/categories` | Árbol completo (sistema + workspace) |
| `POST` | `/api/categories` | Crear categoría personalizada del workspace |
| `PUT` | `/api/categories/[id]` | Actualizar (solo las del workspace) |
| `DELETE` | `/api/categories/[id]` | Eliminar (solo las del workspace, no SYSTEM) |

#### Endpoints — Métodos de Pago

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/payment-methods` | Listar del workspace |
| `POST` | `/api/payment-methods` | Crear (tarjeta, efectivo, wallet) |
| `PUT` | `/api/payment-methods/[id]` | Actualizar alias, color, isDefault |
| `DELETE` | `/api/payment-methods/[id]` | Eliminar (si no tiene transacciones) |

#### Endpoints — Transacciones

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| `GET` | `/api/transactions` | `type, categoryId, from, to, memberId, page, limit` | Lista paginada |
| `POST` | `/api/transactions` | — | Crear transacción |
| `GET` | `/api/transactions/[id]` | — | Detalle con splits y adjuntos |
| `PUT` | `/api/transactions/[id]` | — | Editar |
| `DELETE` | `/api/transactions/[id]` | — | Eliminar |
| `GET` | `/api/transactions/[id]/splits` | — | Ver quién debe qué |
| `POST` | `/api/transactions/[id]/splits` | — | Dividir entre miembros |

#### MODIFY — Rutas v1 a v2

| Archivo | Cambio |
|---------|--------|
| [MODIFY] `src/app/api/transactions/route.ts` | Reescribir con auth + Zod + workspace |
| [MODIFY] `src/app/api/transactions/[id]/route.ts` | Mismo patrón |
| [MODIFY] `src/app/api/categories/route.ts` | Reescribir con árbol jerárquico |
| [MODIFY] `src/app/api/analytics/route.ts` | Adaptar al nuevo schema |

---

### Fase 5 — Suscripciones y Presupuestos
**Estimado:** ~3h · **Requiere Fase 4**

#### Endpoints — Suscripciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/subscriptions` | Listar con estado y próximo cobro |
| `POST` | `/api/subscriptions` | Crear suscripción |
| `GET` | `/api/subscriptions/[id]` | Detalle + historial de pagos |
| `PUT` | `/api/subscriptions/[id]` | Actualizar |
| `DELETE` | `/api/subscriptions/[id]` | Eliminar |
| `POST` | `/api/subscriptions/[id]/toggle` | Activar / Pausar |

#### Lógica especial de suscripciones
- Al crear: calcular `nextBillingDate` según `billingCycle`
- Al hacer toggle a ACTIVE desde PAUSED: recalcular `nextBillingDate`
- El cron job (Fase 7) generará transacciones automáticas en `nextBillingDate`

#### Endpoints — Presupuestos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/budgets` | Listar + gasto actual por categoría |
| `POST` | `/api/budgets` | Crear límite para categoría y período |
| `PUT` | `/api/budgets/[id]` | Actualizar monto, alerta, rollover |
| `DELETE` | `/api/budgets/[id]` | Eliminar presupuesto |

#### Lógica especial de presupuestos
- El GET calcula automáticamente el gasto actual del período
- Si el gasto > `alertAt`% → marcar budget como en alerta

---

### Fase 6 — Metas de Ahorro
**Estimado:** ~2h · **Requiere Fase 4**

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/savings` | Listar metas con progreso y aportaciones |
| `POST` | `/api/savings` | Crear meta |
| `GET` | `/api/savings/[id]` | Detalle con historial de contribuciones |
| `PUT` | `/api/savings/[id]` | Actualizar meta |
| `DELETE` | `/api/savings/[id]` | Eliminar |
| `POST` | `/api/savings/[id]/contribute` | Registrar aportación al ahorro |

#### Lógica especial
- Al contribuir: `currentAmount += amount` en `SavingsGoal`
- Si `currentAmount >= targetAmount` → marcar `isCompleted = true`, `completedAt = now()`
- Crear notificación tipo `GOAL_REACHED` automáticamente

---

### Fase 7 — Analytics y Notificaciones
**Estimado:** ~3h · **Requiere Fase 4 + 5 + 6**

#### Endpoints — Analytics

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| `GET` | `/api/analytics` | `periodType, count` | Resumen por período (semanal/quincenal) |
| `GET` | `/api/analytics/summary` | `from, to` | Balance, ingresos, gastos del período |
| `GET` | `/api/analytics/by-category` | `from, to, type` | Agrupado por categoría |
| `GET` | `/api/analytics/by-member` | `from, to` | Gastos por miembro |

#### Endpoints — Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/notifications` | Listar del usuario (no leídas primero) |
| `PUT` | `/api/notifications/[id]/read` | Marcar una como leída |
| `PUT` | `/api/notifications/read-all` | Marcar todas como leídas |

---

## Resumen de Todo el Backend

| Fase | Módulo | Endpoints | Archivos nuevos |
|------|--------|-----------|----------------|
| 1 | Infraestructura | 0 | 12 |
| 2 | Auth | 2 manejadores | 2 |
| 3 | Workspaces + Invitaciones | 8 | 6 |
| 4 | Core Financiero | 14 | 8 (4 nuevos + 4 modificados) |
| 5 | Suscripciones + Presupuestos | 10 | 4 |
| 6 | Metas de Ahorro | 6 | 3 |
| 7 | Analytics + Notificaciones | 7 | 5 |
| **Total** | **7 módulos** | **~47 endpoints** | **~40 archivos** |

---

## Dependencias npm a Instalar

```bash
# Runtime
npm install next-auth@beta bcryptjs zod

# Dev/Testing
npm install --save-dev \
  vitest \
  @vitest/coverage-v8 \
  @vitest/ui \
  vitest-mock-extended \
  @types/bcryptjs
```

---

## Variables de Entorno Requeridas

```env
# Ya configuradas
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/finance_tracker"

# Por configurar
AUTH_SECRET="[mínimo 32 caracteres, generar con: openssl rand -base64 32]"
AUTH_URL="http://localhost:3000"
```

---

## Plan de Verificación

### Por Fase
Cada fase genera tests antes de avanzar a la siguiente:

```bash
# Tests unitarios (sin BD)
npm run test

# Coverage mínimo 80%
npm run test:coverage

# Build de TypeScript sin errores
npx tsc --noEmit
```

### Verificación Final
1. `npm run build` — 0 errores TypeScript
2. `npm run test:coverage` — todas las suites en verde, >80%
3. Dashboard cargando datos reales del workspace
4. Login / register funcionando
5. CRUD de transacciones funcionando desde el dashboard

---

## Open Questions

> [!NOTE]
> **¿Empezamos por la Fase 1 directamente?** Las fases están en orden de dependencia y están listas para ejecutarse.
