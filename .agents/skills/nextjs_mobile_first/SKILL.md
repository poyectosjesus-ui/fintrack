---
name: nextjs-mobile-first-foundations
version: 1.0.0
description: >
  Guía completa para construir interfaces mobile-first modernas y listas para
  producción en Next.js con Tailwind CSS, TypeScript, testing y performance
  optimization. Úsala al desarrollar componentes React responsivos, aplicaciones
  full-stack, o cuando el diseño mobile-first sea prioridad.
tags:
  - nextjs
  - react
  - tailwindcss
  - typescript
  - mobile-first
  - frontend
  - testing
  - accessibility
  - performance
stack:
  - Next.js 14+
  - React 19
  - Tailwind CSS v4
  - TypeScript 5+
  - Vitest
  - Playwright
author: FinTrack Dev Team
license: MIT
---

# Skill: Next.js Mobile-First Native App Experience

<identity>
**Para Antigravity (AI Coding Assistant):**  
Este skill dicta las reglas fundamentales que **DEBES** seguir irrestrictamente al crear o modificar interfaces de usuario web móviles. Como Antigravity, estás encargado de que toda app frontend se sienta y luzca exactamente como una **Aplicación Nativa (iOS/Android)** usando Next.js 16+ y Tailwind CSS v4. No se admiten interfaces web convencionales si se requiere enfoque 'Mobile-First'.

**Convención de Secuencias de Comandos (Scripts):**
Si esta skill, o cualquier automatización derivada de ella, requiere secuencias de comandos (ej. bash scripts para scaffolding), estas **deben** colocarse obligatoriamente en el subdirectorio estructural `scripts/` (ej: `.agents/skills/scripts/`). Además, debes hacer referencia a ellas en este archivo markdown usando **rutas de acceso relativas**.
</identity>

---

## Cuándo usar este skill

- Al crear un nuevo proyecto Next.js desde cero
- Al añadir una nueva página o sección a una app existente
- Al diseñar un componente que deba funcionar en mobile y desktop
- Cuando el usuario pida "mobile-first", "responsive" o "PWA"

---

## 1. Principios Core

### Mobile-First Approach & Native Feel
- **Diseña para sentirse Nativo**: Debes implementar `100dvh`, usar `BottomTabBar` (navegación inferior translúcida con blur) y `TopNav` fijo.
- **Micro-interacciones y Animaciones**: Usa efectos como presionar y hundir (`active:scale-95`), "slide up" al abrir modales (`BottomSheet` resbaladizos con borderRadius de 32px), y transiciones muy fluidas.
- **Scroll Contenido**: Prohíbe el scroll general del viewport. Solo el `<main>` dentro del layout debe scrollear usando `overflow-y-auto`.
- **Modales Deslizables (Bottom Sheets)**: No uses alertas web tradicionales ni dialogos centrados web-like para interacciones primarias. Utiliza Action Sheets o modales que se deslizan desde abajo (`backdrop-blur-sm`).
- **Touch-Friendly**: Tap targets gigantes (mín. 44px o 48px), grandes inputs limpios sin bordes afilados (`rounded-3xl` o `2xl`).
- **Diseño Premium**: Evita colores primarios aburridos (usa degradados, fondos `#0a0e1a` o `zinc-950/900`, íconos llamativos emoji o lucide, e interfaces estilo "Wallet").

### Estándares de Calidad del Código
- **Type Safety**: 100% TypeScript, sin tipos `any`
- **Error Handling**: try-catch, error boundaries, fallbacks elegantes
- **Testing**: Unit (Vitest), Integración (Testing Library), E2E (Playwright)
- **Accessibility**: WCAG 2.1 AA, HTML semántico, labels ARIA
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1

---

## 2. Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout con metadata
│   ├── page.tsx              # Home page
│   ├── (auth)/               # Route group — sin navbar
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/                  # API routes
│   │   └── users/route.ts
│   └── globals.css
├── components/
│   ├── ui/                   # Componentes reutilizables
│   ├── features/             # Componentes por feature
│   └── layout/               # Header, Footer, Navigation
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities, API client
├── types/                    # TypeScript definitions
└── tests/                    # Tests paralelos a src/
```

### Configuración Next.js

```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.example.com' }],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
};
export default nextConfig;
```

---

## 3. CSS Mobile-First con Tailwind

### Patrón utility-first responsive

```typescript
// ✅ CORRECTO: Mobile-first (primero mobile, luego escala)
<div className="w-full px-4 md:px-6 lg:px-8">
  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
    Título Mobile-First
  </h1>
</div>

// ❌ INCORRECTO: Desktop-first (evitar)
// <div className="w-1/2 px-8">
```

### Breakpoints de Tailwind

| Dispositivo | Prefijo | Min Width |
|------------|---------|-----------|
| Mobile | (sin prefijo) | 0px |
| Tablet small | `sm` | 640px |
| Tablet | `md` | 768px |
| Laptop | `lg` | 1024px |
| Desktop | `xl` | 1280px |
| Desktop grande | `2xl` | 1536px |

### Botón Touch-Friendly

```typescript
// components/ui/Button.tsx
import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className, variant = 'primary', size = 'md',
  isLoading = false, children, disabled, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-all duration-200 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'min-h-[44px] min-w-[44px] px-4',   // touch target mínimo
        {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          ghost: 'text-gray-700 hover:bg-gray-100',
        }[variant],
        { sm: 'text-sm h-9 px-3', md: 'text-base h-11 px-4', lg: 'text-lg h-12 px-6' }[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
```

---

## 4. Arquitectura de Componentes

### Server vs Client Components

```typescript
// app/users/page.tsx — SERVER COMPONENT (default)
// ✅ Puede hacer fetch directamente, sin necesidad de API route
export default async function UsersPage() {
  const users = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },
  }).then(r => r.json());

  return <UserList initialUsers={users} />;
}

// components/features/UserList.tsx — CLIENT COMPONENT
'use client';
import { useState } from 'react';

export function UserList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const r = await fetch('/api/users');
      if (!r.ok) throw new Error('Error al cargar');
      setUsers(await r.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button onClick={refresh} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
      {error && <div className="rounded-lg bg-red-100 p-4 text-red-800" role="alert">{error}</div>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {users.map(user => <UserCard key={user.id} user={user} />)}
      </div>
    </div>
  );
}
```

---

## 5. Type Safety & Error Handling

### Tipos globales

```typescript
// types/index.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: { page: number; limit: number; total: number; pages: number };
}
```

### Client de API tipado con manejo de errores

```typescript
// lib/api.ts
export class ApiError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new ApiError(response.status, err.code || 'UNKNOWN', err.message || `HTTP ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'NETWORK_ERROR', 'Network request failed');
  }
}
```

---

## 6. Testing

### Unit Tests (Vitest + Testing Library)

```typescript
// tests/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('llama onClick al hacer clic', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clic</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('está deshabilitado cuando isLoading=true', () => {
    render(<Button isLoading>Cargando</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### E2E (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('login exitoso redirige al dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});

test('responsive en mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
});
```

---

## 7. Performance

```typescript
// Imágenes con Next/Image
import Image from 'next/image';
<Image
  src="/hero.jpg" alt="Hero"
  width={1200} height={600}
  priority                                          // Solo above-fold
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Dynamic imports para componentes pesados
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
  ssr: false,
});
```

---

## 8. Accesibilidad (a11y)

```typescript
// ✅ HTML Semántico con ARIA
<nav aria-label="Navegación principal">
  <ul>
    <li><a href="/">Inicio</a></li>
  </ul>
</nav>

<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" aria-describedby="email-hint" />
<span id="email-hint">Nunca compartiremos tu email.</span>
```

---

## 9. Patrones Comunes

### Grid Responsivo
```typescript
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Menú hamburguesa mobile
```typescript
'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden" aria-label="Menú">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white lg:hidden">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="/">Inicio</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
        </div>
      )}
    </>
  );
}
```

---

## Checklist de Verificación

```
✅ Diseño mobile-first (320px+ como base)
✅ TypeScript strict mode activado
✅ HTML semántico + ARIA labels
✅ Image optimization (Next/Image)
✅ Touch targets mínimo 44×44px
✅ Error boundaries implementados
✅ Tests unitarios + E2E con >80% cobertura
✅ Core Web Vitals optimizados (LCP <2.5s)
✅ Sin console.error en producción
✅ Audit de accesibilidad pasado (Lighthouse)
✅ Sin tipos `any` en TypeScript
```
