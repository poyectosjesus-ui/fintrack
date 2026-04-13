# 02 — Historias de Usuario

> Formato: **Como** [rol] **quiero** [acción] **para** [beneficio]

---

## 2.1 Autenticación y Usuarios

### US-001 · Registro de Usuario
- **Como** usuario nuevo
- **Quiero** crear una cuenta con email y contraseña
- **Para** acceder a la aplicación de forma segura

### US-002 · Invitación a Pareja/Familia
- **Como** propietario del grupo familiar (`OWNER`)
- **Quiero** invitar a mi pareja mediante email o código único
- **Para** compartir el control financiero de forma segura

---

## 2.2 Gestión de Gastos

### US-003 · Registrar Gasto
- **Como** miembro de la familia
- **Quiero** registrar un gasto con descripción, monto, categoría, fecha y medio de pago
- **Para** mantener un registro transparente del gasto familiar

### US-004 · Suscripciones Recurrentes
- **Como** usuario
- **Quiero** registrar suscripciones (Netflix, Spotify, etc.) con frecuencia (mensual, anual, etc.)
- **Para** evitar olvidos y controlar gastos recurrentes automáticamente

### US-005 · Renta y Servicios Fijos
- **Como** propietario del hogar
- **Quiero** registrar renta, servicios (agua, luz, internet) y cuotas de préstamos
- **Para** automatizar los cálculos mensuales y tener claridad sobre obligaciones financieras

---

## 2.3 Gestión de Ingresos

### US-006 · Registrar Ingresos
- **Como** miembro de la familia
- **Quiero** registrar ingresos (salarios, bonificaciones, ingresos adicionales) con tipo de ingreso
- **Para** tener visibilidad total de ingresos y presupuestar mejor

---

## 2.4 Métodos de Pago

### US-007 · Registrar Método de Pago
- **Como** usuario
- **Quiero** asociar gastos a métodos de pago específicos (tarjeta, efectivo, transferencia)
- **Para** hacer seguimiento de cómo se distribuyen mis gastos por medio de pago

---

## 2.5 Metas de Ahorro

### US-008 · Crear Meta de Ahorro
- **Como** pareja/familia
- **Quiero** establecer metas de ahorro (vacaciones, casa, emergencia) con monto objetivo y plazo
- **Para** motivarnos a ahorrar juntos y hacer seguimiento del progreso

### US-009 · Visualizar Progreso de Metas
- **Como** usuario
- **Quiero** ver el progreso de cada meta con barras de progreso, fechas y montos restantes
- **Para** mantenerme motivado y ver el avance en tiempo real

---

## 2.6 Reportes y Análisis

### US-010 · Dashboard Principal
- **Como** usuario
- **Quiero** ver un dashboard con resumen de ingresos, gastos, balance, metas y próximos pagos
- **Para** tener una visión rápida de la salud financiera de la familia

### US-011 · Reportes Detallados
- **Como** usuario
- **Quiero** generar reportes por período, categoría y miembro con gráficos
- **Para** analizar tendencias y tomar decisiones financieras informadas

---

## 2.7 Notificaciones

### US-012 · Recordatorio de Pagos Próximos
- **Como** usuario
- **Quiero** recibir notificaciones de pagos próximos (renta, servicios, suscripciones)
- **Para** evitar olvidos y retrasos en pagos

---

## 📌 Resumen

| ID | Área | Prioridad |
|----|------|-----------|
| US-001 | Auth | 🔴 Alta |
| US-002 | Auth | 🔴 Alta |
| US-003 | Gastos | 🔴 Alta |
| US-004 | Recurrentes | 🟡 Media |
| US-005 | Recurrentes | 🟡 Media |
| US-006 | Ingresos | 🔴 Alta |
| US-007 | Métodos de Pago | 🟡 Media |
| US-008 | Metas | 🟡 Media |
| US-009 | Metas | 🟢 Baja |
| US-010 | Dashboard | 🔴 Alta |
| US-011 | Reportes | 🟡 Media |
| US-012 | Notificaciones | 🟢 Baja |
