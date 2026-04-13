# 06 — Características Avanzadas

---

## 📱 PWA (Progressive Web App)

La app debe funcionar como una **app nativa instalable** en iOS y Android.

### Requisitos
- `manifest.json` con nombre, íconos y splash screens
- Service Worker para cache y funcionalidad offline
- Instalación en pantalla de inicio ("Add to Home Screen")

### Implementación
```bash
npm install next-pwa
```

```javascript
// next.config.ts
const withPWA = require("next-pwa")({ dest: "public" })
module.exports = withPWA({ ... })
```

### Cache Strategy
| Recurso | Estrategia |
|---------|-----------|
| Assets estáticos (JS, CSS, imágenes) | Cache First |
| Datos del dashboard | Stale While Revalidate |
| Formularios de escritura | Network First |
| Datos offline críticos | Cache Only (pre-cacheado) |

---

## 🔔 Notificaciones Push

### Web Push API
- Suscripción con `serviceWorker.pushManager.subscribe()`
- Claves VAPID generadas una sola vez
- Las suscripciones se guardan en BD por usuario

### Tipos de notificaciones
| Tipo | Cuándo se dispara |
|------|-------------------|
| `PAYMENT_DUE` | 3 días antes del vencimiento |
| `GOAL_REACHED` | Al llegar al 100% de la meta |
| `INVITE` | Al recibir invitación a una familia |
| `SYSTEM` | Mantenimiento o actualizaciones |

### Implementación del cron job
Se puede usar **Vercel Cron** o un endpoint llamado por un scheduler externo:

```typescript
// app/api/cron/check-payments/route.ts
// Se ejecuta diariamente a las 8am
export async function GET() {
  const upcoming = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      dueDate: { gte: today, lte: threeDaysFromNow }
    }
  })
  // Enviar notificaciones push a los usuarios correspondientes
}
```

---

## ⚡ Sincronización en Tiempo Real

### Tecnología: WebSockets con Next.js

Para que cambios de un miembro se reflejen instantáneamente en otros dispositivos:

**Opción A — Server-Sent Events (SSE)** _(más simple, recomendada para MVP)_
```typescript
// app/api/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Emit events when data changes
    }
  })
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" }
  })
}
```

**Opción B — WebSockets con Pusher** _(tercero, más fácil)_
- Pusher Channels o Ably para pub/sub en tiempo real
- Emitir evento cuando se crea/edita/elimina una transacción

### Resolución de conflictos
- Usar `updatedAt` como timestamp para detectar conflictos
- "Last Write Wins" como estrategia base
- Mostrar alerta si dos miembros editan al mismo tiempo

---

## 🔒 Seguridad

### Autenticación
- ✅ Contraseñas hasheadas con **bcrypt** (nunca en texto plano)
- ✅ JWT con tiempo de expiración corto + refresh tokens
- ✅ Recuperación de contraseña con tokens de un solo uso

### Autorización
- ✅ Control de acceso por rol (`OWNER > ADMIN > MEMBER`)
- ✅ Verificar `familyId` en cada request — ningún usuario puede ver datos de otra familia
- ✅ Middleware de autenticación en todas las rutas protegidas

### API Security
- ✅ Rate limiting: máximo 100 req/min por IP
- ✅ CORS restringido al dominio propio
- ✅ Headers de seguridad: `X-Frame-Options`, `CSP`, `HSTS`
- ✅ Validación de inputs con Zod en todas las rutas

### Datos Sensibles
- ✅ Solo últimos 4 dígitos de tarjetas (no almacenar número completo)
- ✅ Variables de entorno para secretos (nunca en código)
- ✅ `.env` excluido del repositorio (`.gitignore`)

---

## 🚀 Performance

| Optimización | Cómo |
|-------------|------|
| **Code splitting** | Automático por Next.js (por página) |
| **Image optimization** | `next/image` con formatos WebP/AVIF |
| **Lazy loading** | Componentes pesados con `React.lazy` y `Suspense` |
| **Caching de consultas** | SWR con revalidación inteligente |
| **Compresión** | Gzip/Brotli activado en producción |
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| **Índices de BD** | `date`, `categoryId`, `familyId` en tablas principales |

---

## 📊 Analytics

- **Google Analytics 4** para métricas de uso general
- Eventos personalizados:
  - `expense_created`
  - `goal_reached`
  - `report_viewed`
  - `family_invited`
- Dashboard interno de métricas en `/admin` (solo `OWNER`)
