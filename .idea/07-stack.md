# 07 — Stack Tecnológico

> Decisiones técnicas y justificación de cada herramienta.

---

## 🏗️ Full Stack

| Capa | Tecnología | Versión | Por qué |
|------|-----------|---------|---------|
| Framework | **Next.js** | 16+ | App Router, Server Components, API Routes en un solo proyecto |
| Lenguaje | **TypeScript** | 5+ | Tipado fuerte, mejor DX, errores en tiempo de compilación |
| Runtime | **Node.js** | 20+ LTS | Estable, soporte largo plazo |

---

## 🎨 Frontend

| Herramienta | Uso |
|-------------|-----|
| **Tailwind CSS v4** | Estilos utilitarios, mobile-first por defecto |
| **Shadcn/ui** | Componentes accesibles y personalizables (Button, Dialog, Card, etc.) |
| **Recharts** | Gráficas (pie chart, bar chart, area chart) |
| **SWR** | Data fetching con caché y revalidación automática |
| **date-fns** | Manipulación de fechas, localización en español |
| **lucide-react** | Íconos SVG consistentes y ligeros |

---

## 🗄️ Backend / Base de Datos

| Herramienta | Uso |
|-------------|-----|
| **PostgreSQL** | Base de datos relacional principal |
| **Prisma 7** | ORM con tipado automático, migraciones y Prisma Studio |
| **@prisma/adapter-pg** | Driver nativo para Prisma 7 con PostgreSQL |
| **NextAuth.js v5** | Autenticación: sesiones JWT, OAuth providers |
| **bcryptjs** | Hash seguro de contraseñas |
| **Zod** | Validación de schemas en API Routes y formularios |

---

## 📱 PWA y Notificaciones

| Herramienta | Uso |
|-------------|-----|
| **next-pwa** | Service Workers, manifest, offline support |
| **web-push** | Notificaciones push con VAPID keys |

---

## 📧 Comunicación

| Herramienta | Alternativa | Uso |
|-------------|-------------|-----|
| **Resend** | Nodemailer | Emails transaccionales (invitaciones, recuperación de contraseña) |
| **Pusher** | Server-Sent Events | Sincronización en tiempo real (opcional) |

---

## 🛠️ Desarrollo y Calidad

| Herramienta | Uso |
|-------------|-----|
| **ESLint** | Linting de código TypeScript/React |
| **Prettier** | Formateo automático de código |
| **Husky + lint-staged** | Pre-commit hooks para calidad |
| **Prisma Studio** | GUI para explorar la base de datos en desarrollo |

---

## 🚀 Infraestructura y Despliegue

| Servicio | Alternativa | Uso |
|---------|-------------|-----|
| **Vercel** | Railway, Fly.io | Hosting del frontend y API routes |
| **Supabase / Neon** | PlanetScale | PostgreSQL managed en la nube |
| **Vercel Cron** | cron-job.org | Tareas programadas (recordatorios de pagos) |
| **Cloudflare** | — | CDN y protección DDoS |

---

## 📦 `package.json` — Dependencias Clave

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "next-auth": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.0",
    "swr": "^2.2.0",
    "recharts": "^3.0.0",
    "date-fns": "^4.0.0",
    "lucide-react": "^0.400.0",
    "next-pwa": "^5.6.0",
    "web-push": "^3.6.0",
    "resend": "^3.0.0"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "ts-node": "^10.9.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## ⚙️ Variables de Entorno Necesarias

```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/fintrack_familia"

# Autenticación
AUTH_SECRET="clave-super-secreta-de-32-caracteres"
AUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="noreply@fintrack.app"

# Web Push (Notificaciones)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="admin@fintrack.app"

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=""
```
