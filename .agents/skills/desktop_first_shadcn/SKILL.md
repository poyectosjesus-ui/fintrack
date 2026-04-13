---
name: desktop-first-shadcn-ui
version: 1.0.0
description: >
  Directiva maestra de diseño Frontend. Establece el uso estricto de la filosofía Desktop-First
  con componentes Shadcn de cero dependencias. Toda interfaz debe priorizar la experiencia en monitor/laptop
  usando arquitecturas Full-Responsive amigables, limpias y altamente visuales.
tags:
  - nextjs
  - react
  - tailwindcss
  - desktop-first
  - shadcn-ui
  - responsive
author: FinTrack UX Team
---

# Skill: Desktop-First Shadcn UI Architecture

<identity>
**Para Antigravity (AI Coding Assistant):**  
Esta es tu directiva central de diseño web. El usuario ha rechazado la filosofía "Mobile-First" estricta que dictaba interfaces web constreñidas (BottomSheet, TabBars intrusivos).
A partir de este momento, **ABANDONAS** el paradigma Mobile-First. 

Tu nuevo mandamiento es diseñar aplicaciones **Desktop-First (Prioridad Escritorio)**. Esto significa que la aplicación debe verse espectacular, espaciosa, inmersiva y altamente productiva en un monitor o pantalla de laptop en primer lugar, y de ahí acoplarse y volverse *Full Responsive* de manera natural (y no al revés).
</identity>

---

## 1. Principios Core de Diseño

### Desktop-First Approach
- **Liberación de Ancho de Pantalla:** Usa `w-full max-w-screen-2xl mx-auto` para que los dashboards utilicen inteligentemente el espacio horizontal de los monitores.
- **Adiós Navigation Móvil en Desktop:** Prohibido usar `BottomTabBar` o modales estilo `BottomSheet` en la experiencia de escritorio. Depende de `TopNavs` robustos, `Sidebars` espaciadas y `Dialogs` (Modales centrados con desenfoque).
- **Grillas Inteligentes:** En lugar de listas de una columna (típicas de móvil), proyecta arquitecturas CSS Grid agresivas (`grid-cols-2`, `grid-cols-3`, `grid-cols-4`) para distribuir la información como las SaaS profesionales modernas.
- **Responsive Degration (Downscaling):** La app sigue siendo 100% responsiva (se verá perfecta en el celular plegando las columnas a 1, y escondiendo barras grandes atrás de menús de hamburguesa), pero el diseño "base" mental es la laptop.

### Shadcn UI (Regla de Oro)
- **Monopolio Shadcn:** Únicamente utilizarás la estética y arquitectura de la librería [Shadcn/UI](https://ui.shadcn.com/). 
- **Zero-Dependency Core:** Si estás en un entorno restringido, debes reconstruir las fachadas de Shadcn manualmente en la carpeta `src/components/ui/` (`<Card>`, `<Button>`, `<Input>`, `<Dialog>`, etc) usando Tailwind CSS crudo pero exacto, sin alterar la firma nativa de la librería.
- **Iconografía Lucide:** Todos los iconos deben provenir de `lucide-react`. Queda estrictamente negado el uso de emojis unicode en la interfaz maestra de usuario.

### Colores Adecuados y Filosofía Amigable
- Nada de colores estridentes puros desbalanceados.
- Emplea tonos neutrales profundos (`zinc-900`, `zinc-950`) apilados con tarjetas con delineados sutiles (`border-zinc-800`). 
- Emplea sutiles *Glows* (Ej: Sombras violetas ligeras `shadow-indigo-500/20` o luces esmeraldas) para denotar acciones financieras que dan satisfacción visual.

---

## 2. Refactorización de Interfaz (CSS & Tailwind)

### Patrón Full Responsive desde Desktop

```typescript
// ✅ CORRECTO: Desktop base, ajustándose grácilmente a móvil
<div className="w-full mx-auto max-w-screen-2xl px-6 lg:px-8">
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
    <Card />
    <Card />
    <Card />
  </div>
</div>

// ❌ INCORRECTO: Obligar a los usuarios de desktop a ver una franja diminuta en el centro
// <div className="max-w-md mx-auto w-full h-dvh">
```

### Formularios y Controles (Amigables y Espaciados)
- **Alturas Prominentes:** Elementos clickeables deben tener `h-12` (48px) para ser extremadamente amables con el cursor o el dedo.
- **Espaciado y Respiración:** Los labels (`<Label>`) deben vivir fuera del `<Input>` con un saludable espacio (`gap-2`) para no abrumar al cerebro con información apretada.

```typescript
// Ejemplo de Formulario Shadcn Estándar
<div className="space-y-6">
  <div className="grid gap-2">
    <Label htmlFor="email" className="text-zinc-400">Correo Electrónico</Label>
    <Input id="email" type="email" placeholder="ejemplo@correo.com" className="h-12 pl-4" />
  </div>
  <Button className="h-12 w-full sm:w-auto font-bold bg-indigo-600 hover:bg-indigo-700">
    Guardar Cambios
  </Button>
</div>
```

---

## 3. Checklist de Ejecución
- `[ ]` Nunca implementes *BottomSheets* o layouts estancados verticalmente como primera solución general si se pide una vista de gestión en la computadora.
- `[ ]` Garantizar que todos los componentes provienen de importaciones de `@/components/ui/`.
- `[ ]` Cerciorar que se utilicen `gap-6` a `gap-8` entre contenedores pesados para dar flujo de aire profesional.
