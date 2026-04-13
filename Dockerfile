# Capa 1: Dependencias
FROM node:20-alpine AS deps
# Necesario para ciertas dependencias binarias en alpine (Prisma requiere openssl y libc6)
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Capa 2: Constructor
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Cliente Prisma
RUN npx prisma generate

# Desactivamos telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar Aplicación (Asegúrate de tener output: 'standalone' en next.config.ts)
RUN npm run build

# Capa 3: Producción / Máquina Ejecutora
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar OpenSSL porque se necesita en runtime para DB
RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configurar carpetas estáticas
COPY --from=builder /app/public ./public

# Directorios autogenerados con dependencias mínimas por Standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Incluir carpeta Prisma (por si ocupas migraciones o esquema nativo)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Iniciar el servidor embebido
CMD ["node", "server.js"]
