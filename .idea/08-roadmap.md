# 08 — Roadmap de Desarrollo

> Fases ordenadas por prioridad. Cada fase debe estar **probada y estable** antes de pasar a la siguiente.

---

## 🗓️ Fase 1 — MVP (Semanas 1–3)
> *"Puedo registrar mis gastos e ingresos"*

- [ ] Configurar proyecto Next.js con TypeScript y Tailwind CSS
- [ ] Configurar PostgreSQL y Prisma (schema base + seed)
- [ ] Implementar autenticación básica con NextAuth.js (email + contraseña)
- [ ] CRUD de **Categorías** (sistema y personalizadas)
- [ ] CRUD de **Gastos**
- [ ] CRUD de **Ingresos**
- [ ] **Dashboard** básico con balance, ingresos y gastos del mes
- [ ] Despliegue inicial en Vercel + Supabase/Neon

---

## 🗓️ Fase 2 — Familias y Colaboración (Semanas 4–5)
> *"Puedo compartir mis finanzas con mi pareja"*

- [ ] Modelo de **Familias** y **Miembros** en BD
- [ ] Flujo de invitación por código único
- [ ] Roles: `OWNER`, `ADMIN`, `MEMBER`
- [ ] Ver gastos/ingresos de todos los miembros
- [ ] Ajustes del grupo familiar (nombre, moneda, miembros)

---

## 🗓️ Fase 3 — Métodos de Pago y Recurrentes (Semanas 6–7)
> *"El sistema recuerda mis suscripciones y pagos fijos"*

- [ ] CRUD de **Métodos de Pago**
- [ ] Asociar método de pago a cada gasto
- [ ] CRUD de **Transacciones Recurrentes**
- [ ] Generación automática de gastos recurrentes (cron job)
- [ ] Vista de **próximos pagos** en el dashboard

---

## 🗓️ Fase 4 — Metas de Ahorro (Semana 8)
> *"Podemos ahorrar juntos para nuestras metas"*

- [ ] CRUD de **Metas de Ahorro**
- [ ] Flujo de aportación a una meta
- [ ] Barra de progreso visual
- [ ] Widget de metas en el dashboard

---

## 🗓️ Fase 5 — Reportes y Análisis (Semana 9)
> *"Entiendo a dónde va nuestro dinero"*

- [ ] Página de **Reportes** con todos los filtros
- [ ] Gráfica de gastos por categoría (pie chart)
- [ ] Gráfica de ingresos vs gastos por período (bar chart)
- [ ] Tendencia del balance (area chart)
- [ ] Exportar reporte como CSV

---

## 🗓️ Fase 6 — Notificaciones (Semana 10)
> *"Nunca olvido un pago"*

- [ ] Sistema de notificaciones en app (bell icon)
- [ ] Recordatorios de pagos próximos (3 días antes)
- [ ] Notificación en app al alcanzar una meta
- [ ] Email de resumen semanal (opcional)

---

## 🗓️ Fase 7 — PWA y Offline (Semana 11)
> *"La uso como si fuera una app nativa"*

- [ ] Configurar `next-pwa` con Service Worker
- [ ] `manifest.json` con íconos y splash screens
- [ ] Cache offline del dashboard y últimas transacciones
- [ ] Notificaciones push en el navegador
- [ ] Instalación en pantalla de inicio (iOS y Android)

---

## 🗓️ Fase 8 — Pulido y Producción (Semana 12)
> *"Está lista para usar"*

- [ ] Revisión de Core Web Vitals (LCP, FID, CLS)
- [ ] Rate limiting en todas las API routes
- [ ] Tests básicos de las rutas críticas
- [ ] Documentación de usuario final
- [ ] Configuración de dominio propio
- [ ] Monitor de errores (Sentry o LogRocket)
- [ ] Backups automáticos de la base de datos

---

## 🚀 Futuras Mejoras (Post-MVP)

| Feature | Descripción |
|---------|-------------|
| OAuth | Login con Google / GitHub |
| Tiempo real | WebSockets para sincronización instantánea |
| App nativa | React Native / Expo usando la misma API |
| OCR de tickets | Capturar gasto desde foto del ticket |
| IA de categorización | Categorización automática por descripción |
| Presupuestos | Límites de gasto por categoría |
| Multi-moneda | Soporte para USD, EUR, etc. con conversión |
| Reportes PDF | Exportar reportes en PDF con gráficas |

---

## 📊 Métricas de Éxito (MVP)

| Métrica | Objetivo |
|---------|---------|
| Tiempo de carga inicial | < 2 segundos |
| Registro de gasto | < 30 segundos |
| Disponibilidad | 99.5% uptime |
| Cobertura mobile | iOS Safari + Chrome Android |
| Lighthouse PWA score | > 90 |
