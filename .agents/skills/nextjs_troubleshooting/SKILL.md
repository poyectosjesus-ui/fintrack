---
name: nextjs-mobile-first-troubleshooting
version: 1.0.0
description: >
  Guía de troubleshooting y patrones avanzados para desarrollo mobile-first en
  Next.js. Cubre los 6 problemas más comunes (hydration, imágenes, performance,
  TypeScript, touch, APIs) con soluciones listas para producción, y patrones
  avanzados como Compound Components, Render Props y Server/Client split.
tags:
  - nextjs
  - react
  - debugging
  - troubleshooting
  - patterns
  - mobile-first
  - performance
  - typescript
stack:
  - Next.js 14+
  - React 19
  - TypeScript 5+
  - Tailwind CSS
depends-on:
  - nextjs-mobile-first  # Requiere el skill base
author: FinTrack Dev Team
license: MIT
---

# Skill: Next.js Mobile-First — Troubleshooting & Patrones Avanzados

Complemento del skill `nextjs-mobile-first`. Úsalo cuando:
- Encuentres errores de hydration, imágenes o TypeScript
- Necesites optimizar performance en mobile
- Quieras implementar patrones avanzados (Tabs, Modal compound, hooks personalizados)

---

## 1. Problemas Comunes y Soluciones

### ❗ Issue 1: Hydration Mismatch (Pantalla en blanco al cargar)

**Síntoma:** El contenido del SSR no coincide con el CSR → pantalla blanca o warning.

```typescript
// ❌ MALO: Diferente entre servidor y cliente
export function Clock() {
  return <div>{new Date().toLocaleString()}</div>; // ¡Diferente en cada render!
}

// ✅ CORRECTO: Renderizar solo en cliente con isMounted
'use client';
import { useEffect, useState } from 'react';

export function Clock() {
  const [time, setTime] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTime(new Date().toLocaleString());
  }, []);

  // Skeleton mientras hidrata
  if (!isMounted) return <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />;
  return <div>{time}</div>;
}
```

**Alternativa rápida (último recurso):**
```typescript
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && new Date().toLocaleString()}
</div>
```

---

### ❗ Issue 2: Imágenes No Optimizadas

**Síntoma:** Bundle pesado, imágenes lentas, sin formato WebP/AVIF.

```typescript
// ❌ MALO: HTML nativo, sin optimización
<img src="/photo.jpg" alt="Foto" />

// ✅ CORRECTO: Next/Image — automático WebP, lazy loading, CDN
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Foto"
  width={1200}
  height={600}
  priority           // Solo para imágenes above-the-fold
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
/>
```

**Configurar imágenes remotas:**
```typescript
// next.config.ts
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'images.example.com',
    pathname: '/public/**',
  }],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
}
```

---

### ❗ Issue 3: Performance Lenta en Mobile

**Síntoma:** App lenta con 3G/4G, scroll con lag, animaciones stuttering.

```typescript
// 1. Dynamic Imports para componentes pesados (charts, maps, editors)
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false,
});

// 2. Lazy load con IntersectionObserver
'use client';
import { useRef, useEffect, useState } from 'react';

export function LazySection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { rootMargin: '100px' }); // Pre-cargar 100px antes de entrar

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <div className="h-48 animate-pulse bg-gray-100" />}</div>;
}

// 3. Respetar prefers-reduced-motion
export function AnimatedCard() {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={!prefersReducedMotion ? 'transition-transform hover:-translate-y-1' : ''}>
      Contenido
    </div>
  );
}
```

---

### ❗ Issue 4: Errores de TypeScript

**Síntoma:** `Type 'X' is not assignable to type 'Y'`, uso de `any`

```typescript
// ❌ MALO: Sin tipar
function handleChange(event: any) {
  console.log(event.target.value);
}

// ✅ CORRECTO: Tipado explícito
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value); // Autocompletado + seguro
}

// Props de componentes — extender atributos HTML nativos
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </>
  );
}
```

---

### ❗ Issue 5: Problemas de Touch en Mobile

**Síntoma:** Elementos pequeños, hover effects no funcionan, zoom indeseado.

```typescript
// ✅ Touch-friendly: mínimo 44×44px, eventos touch correctos
<button
  className="h-12 w-12 rounded-lg flex items-center justify-center"
  onTouchStart={() => setActive(true)}
  onTouchEnd={() => setActive(false)}
>
  <IconHere />
</button>

// Hook para detectar dispositivo touch
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }, []);
  return isTouchDevice;
}
```

---

### ❗ Issue 6: API Calls Fallando

**Síntoma:** Errores de red, timeout, CORS, sin retry.

```typescript
// ✅ Fetch con retry y exponential backoff
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10_000), // 10s timeout
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json() as T;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** i, 10_000)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Hook useFetch reutilizable
'use client';
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWithRetry<T>(url);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [url]);
  return { data, isLoading, error, refetch: fetchData };
}
```

---

## 2. Patrones Avanzados

### Patrón: Compound Components (Tabs)

```typescript
'use client';
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{ active: string; set: (v: string) => void } | null>(null);

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [active, set] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, set }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={ctx.active === value}
      onClick={() => ctx.set(value)}
      className={`px-4 py-2 font-medium transition-colors ${
        ctx.active === value ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.active !== value) return null;
  return <div role="tabpanel" className="py-4">{children}</div>;
}

// Uso:
// <Tabs defaultValue="gatos">
//   <TabsTrigger value="gatos">Gastos</TabsTrigger>
//   <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
//   <TabsContent value="gastos">...</TabsContent>
// </Tabs>
```

---

### Patrón: Custom Hook + useModal

```typescript
'use client';
import { useState, useCallback } from 'react';

export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  return { isOpen, open, close, toggle };
}

// Modal accesible con backdrop
export function Modal({ isOpen, onClose, children }: {
  isOpen: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

---

### Patrón: Server + Client Split Óptimo

```typescript
// ✅ app/posts/page.tsx — SERVER (async, nada de hooks)
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  return (
    <div className="space-y-4">
      {posts.map((post: Post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}

// components/PostCard.tsx — CLIENT (solo donde se necesita interacción)
'use client';
export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="rounded-lg border p-4">
      <h3 className="font-semibold">{post.title}</h3>
      <button onClick={() => setLiked(!liked)} className="mt-2">
        {liked ? '❤️' : '🤍'} Me gusta
      </button>
    </article>
  );
}
```

---

## 3. Monitoreo de Performance

```typescript
// lib/metrics.ts
export function reportWebVitals() {
  if (!('PerformanceObserver' in window)) return;

  // LCP (Largest Contentful Paint) — objetivo: < 2.5s
  new PerformanceObserver(list =>
    list.getEntries().forEach(e => console.log('LCP:', e.startTime))
  ).observe({ entryTypes: ['largest-contentful-paint'] });

  // CLS (Cumulative Layout Shift) — objetivo: < 0.1
  let cls = 0;
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {
      if (!('hadRecentInput' in e) || !e.hadRecentInput) {
        cls += (e as any).value;
        if (cls > 0.1) console.warn('CLS alto:', cls);
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });
}
```

---

## 4. Debugging Checklist Mobile

```
□ ¿Probado en dispositivo REAL? (no solo Chrome DevTools)
□ ¿Network throttling activado? (3G lento en DevTools)
□ ¿Lighthouse score > 90 en Mobile?
□ ¿Viewport testeado: 320px / 375px / 768px / 1024px?
□ ¿Touch interactions funcionan? (no solo mouse)
□ ¿Probado en iOS Safari? (distinto a Chrome)
□ ¿Bundle Analyzer corrido? (ANALYZE=true npm run build)
□ ¿Sin console.error en producción?
□ ¿axe DevTools sin errores de a11y?
□ ¿Imágenes optimizadas con Next/Image?
```

---

## Referencia Rápida de Comandos

```bash
# Dev
npm run dev                 # Servidor de desarrollo
npm run build && npm start  # Probar build de producción

# Testing
npm test                    # Unit tests (Vitest)
npm run test:e2e            # E2E (Playwright)
npm run test:coverage       # Reporte de coverage

# Optimización
ANALYZE=true npm run build  # Análisis de bundle
npm run lint                # ESLint + TypeScript check
npm run type-check          # Solo TypeScript

# Deploy
vercel                      # Deploy a Vercel
```
