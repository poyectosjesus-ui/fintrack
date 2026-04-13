# 05 — Backend y API

> Runtime: **Next.js API Routes** (App Router) · ORM: **Prisma 7** · Auth: **NextAuth.js v5**

---

## 🗺️ API Routes

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta nueva |
| POST | `/api/auth/[...nextauth]` | Manejador NextAuth (login, logout, session) |
| POST | `/api/auth/forgot-password` | Enviar email de recuperación |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token |

### Gastos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/expenses` | Listar gastos (con filtros) |
| POST | `/api/expenses` | Crear gasto |
| GET | `/api/expenses/:id` | Obtener gasto |
| PUT | `/api/expenses/:id` | Actualizar gasto |
| DELETE | `/api/expenses/:id` | Eliminar gasto |

### Ingresos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/incomes` | Listar ingresos |
| POST | `/api/incomes` | Crear ingreso |
| PUT | `/api/incomes/:id` | Actualizar ingreso |
| DELETE | `/api/incomes/:id` | Eliminar ingreso |

### Transacciones Recurrentes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/recurring` | Listar suscripciones/recurrentes |
| POST | `/api/recurring` | Crear recurrente |
| PUT | `/api/recurring/:id` | Actualizar recurrente |
| DELETE | `/api/recurring/:id` | Eliminar recurrente |
| POST | `/api/recurring/:id/toggle` | Activar/desactivar |

### Metas de Ahorro
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/goals` | Listar metas |
| POST | `/api/goals` | Crear meta |
| PUT | `/api/goals/:id` | Actualizar meta |
| DELETE | `/api/goals/:id` | Eliminar meta |
| POST | `/api/goals/:id/contribute` | Abonar a una meta |

### Métodos de Pago
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/payment-methods` | Listar métodos de pago |
| POST | `/api/payment-methods` | Crear método de pago |
| PUT | `/api/payment-methods/:id` | Actualizar |
| DELETE | `/api/payment-methods/:id` | Eliminar |

### Familia
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/families/me` | Obtener mi grupo familiar |
| POST | `/api/families` | Crear grupo familiar |
| POST | `/api/families/join` | Unirse con código de invitación |
| GET | `/api/families/members` | Listar miembros |
| PUT | `/api/families/members/:id` | Cambiar rol de un miembro |
| DELETE | `/api/families/members/:id` | Revocar acceso |
| POST | `/api/families/invite` | Generar código o enviar email |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/summary` | Resumen: balance, ingresos, gastos |
| GET | `/api/reports/by-category` | Gastos agrupados por categoría |
| GET | `/api/reports/by-period` | Comparativa por períodos |
| GET | `/api/reports/by-member` | Gastos por miembro |

### Notificaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Listar notificaciones del usuario |
| PUT | `/api/notifications/:id/read` | Marcar como leída |
| PUT | `/api/notifications/read-all` | Marcar todas como leídas |

---

## 🔐 Autenticación — NextAuth.js v5

### Estrategia
- **Sesiones con JWT** (sin base de datos de sesiones)
- **Refresh tokens** para mantener sesión activa
- Proveedor de **credenciales** (email + contraseña con bcrypt)
- Prueba futura: **Google OAuth** y **GitHub OAuth**

### Middleware de protección
```typescript
// middleware.ts — protege todas las rutas del dashboard
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/((?!api|auth|_next|public).*)"]
}
```

### Estructura de la sesión
```typescript
interface Session {
  user: {
    id: string
    name: string
    email: string
    image?: string
    familyId?: string
    role: "OWNER" | "ADMIN" | "MEMBER"
  }
}
```

---

## 🛡️ Seguridad

| Capa | Medida |
|------|--------|
| Contraseñas | `bcrypt` con salt rounds = 12 |
| Sesiones | JWT firmado con `AUTH_SECRET` |
| Datos sensibles | Solo últimos 4 dígitos de tarjetas |
| Validación | `Zod` en todas las API routes |
| SQL injection | Prisma usa prepared statements automáticamente |
| CSRF | Protección incluida en NextAuth |
| Rate limiting | `@upstash/ratelimit` o middleware personalizado |
| HTTPS | Obligatorio en producción |

---

## ✅ Validación con Zod

```typescript
// Ejemplo: schema para crear gasto
const ExpenseSchema = z.object({
  amount:          z.number().positive("El monto debe ser positivo"),
  description:     z.string().min(1).max(200),
  categoryId:      z.string().uuid(),
  paymentMethodId: z.string().uuid().optional(),
  date:            z.coerce.date(),
  tags:            z.array(z.string()).optional(),
})
```

---

## 🏗️ Patrón de una API Route

```typescript
// app/api/expenses/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExpenseSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  // 1. Verificar sesión
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // 2. Parsear y validar body
  const body = await req.json()
  const parsed = ExpenseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // 3. Lógica de negocio
  const expense = await prisma.expense.create({
    data: { ...parsed.data, userId: session.user.id, familyId: session.user.familyId! }
  })

  // 4. Respuesta
  return NextResponse.json({ expense }, { status: 201 })
}
```

---

## 📨 Correos Transaccionales

Usar **Resend** o **Nodemailer** con plantillas HTML para:
- Bienvenida al registrarse
- Invitación a unirse a una familia
- Recuperación de contraseña
- Resumen semanal de gastos (opcional)
