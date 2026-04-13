# 🤖 .agent — Skills del Agente

Este directorio contiene **skills** (habilidades) que el agente de IA puede leer
e invocar para realizar tareas específicas con mayor precisión y contexto.

---

## ¿Qué es un Skill?

Un skill es un archivo Markdown estructurado que describe **cómo hacer algo
correctamente** en este proyecto. El agente lo lee antes de generar código para
un dominio específico.

### Estructura obligatoria de un skill

```markdown
---
name: nombre-del-skill          # identificador único, kebab-case
version: 1.0.0                  # semver
description: >
  Descripción de una línea de qué hace y cuándo usarlo.
tags:                           # para búsqueda
  - nextjs
  - react
stack:                          # tecnologías involucradas
  - Next.js 14+
depends-on:                     # skills que este requiere (opcional)
  - otro-skill
author: FinTrack Dev Team
license: MIT
---

# Título del Skill

Explicación breve de cuándo aplicarlo.

## Cuándo usar este skill
...

## Secciones de contenido
...
```

---

## 📚 Skills Disponibles

| Archivo | Nombre | Descripción |
|---------|--------|-------------|
| [nextjs-mobile-first.md](./skills/nextjs-mobile-first.md) | `nextjs-mobile-first` | Fundamentos: estructura, CSS, componentes, testing, performance |
| [nextjs-troubleshooting.md](./skills/nextjs-troubleshooting.md) | `nextjs-mobile-first-troubleshooting` | Debugging, issues comunes y patrones avanzados |

---

## 📁 Estructura de la carpeta

```
.agent/
├── README.md           ← Este archivo (índice de skills)
└── skills/
    ├── nextjs-mobile-first.md         ← Skill base Next.js
    └── nextjs-troubleshooting.md      ← Troubleshooting & patrones
```

---

## Cómo agregar un nuevo Skill

1. Crear un archivo `.md` en `skills/` con el frontmatter completo
2. Agregar la entrada en la tabla de este README
3. Si depende de otro skill, declararlo en `depends-on:`

---

*Generado automáticamente · Proyecto FinTrack Familia · Abril 2026*
