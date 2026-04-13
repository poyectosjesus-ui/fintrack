# 🤖 .agent — Skills del Agente

Este directorio contiene **skills** (habilidades) que el agente lee antes de
generar código para garantizar consistencia, seguridad y calidad en el proyecto.

---

## ¿Qué es un Skill?

Un archivo Markdown estructurado que describe **cómo hacer algo correctamente**.
El agente lo consulta para seguir los patrones establecidos de esta base de código.

### Estructura obligatoria de un Skill

```markdown
---
name: nombre-del-skill       # identificador único kebab-case
version: 1.0.0               # semver
description: >               # qué hace y cuándo usarlo
  Descripción concisa.
tags: [tag1, tag2]           # para búsqueda
stack: [Tech 1, Tech 2]      # tecnologías involucradas
depends-on: [otro-skill]     # skills requeridos (opcional)
author: FinTrack Dev Team
license: MIT
---

# Título
## Cuándo usar este skill
## Secciones de contenido
## Checklist al final
```

---

## 📚 Skills Disponibles

### 🎨 Frontend

| Archivo | Nombre | Descripción |
|---------|--------|-------------|
| [nextjs-mobile-first.md](./skills/nextjs-mobile-first.md) | `nextjs-mobile-first` | Estructura, CSS responsive, componentes, testing E2E, performance |
| [nextjs-troubleshooting.md](./skills/nextjs-troubleshooting.md) | `nextjs-mobile-first-troubleshooting` | Hydration, imágenes, TypeScript, touch, patrones avanzados |

### ⚙️ Backend

| Archivo | Nombre | Descripción |
|---------|--------|-------------|
| [backend-api-routes.md](./skills/backend-api-routes.md) | `backend-api-routes` | Plantillas de API Routes: respuestas tipadas, errores, logging, Prisma |
| [backend-security.md](./skills/backend-security.md) | `backend-security` | NextAuth v5, roles, Zod, rate limiting, headers de seguridad |
| [backend-testing.md](./skills/backend-testing.md) | `backend-testing` | Vitest, mock de Prisma, mock de sesión, coverage mínimo 80% |

---

## 🔗 Grafo de Dependencias

```
nextjs-mobile-first
    └── nextjs-troubleshooting

backend-api-routes
    ├── backend-security
    └── backend-testing
            └── (depende de backend-api-routes + backend-security)
```

---

## 📁 Estructura

```
.agent/
├── README.md                              ← Este archivo (índice)
└── skills/
    ├── nextjs-mobile-first.md             ← Frontend base
    ├── nextjs-troubleshooting.md          ← Frontend troubleshooting
    ├── backend-api-routes.md              ← API Routes patterns
    ├── backend-security.md                ← Auth + Zod + rate limiting
    └── backend-testing.md                 ← Vitest + mocks
```

---

## Cómo agregar un nuevo Skill

1. Crear `skills/nombre-skill.md` con el frontmatter completo
2. Agregar la entrada en la tabla de este README
3. Si depende de otro skill, declararlo en `depends-on:`

---

*FinTrack Familia · Abril 2026*
