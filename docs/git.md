# Git y trabajo colaborativo en AulaLibro

Este documento explica cómo usamos **Git** y **GitHub** en el equipo, con los comandos y un ejemplo real tomado del propio repositorio.

## 1. ¿Qué es Git y qué es GitHub?

- **Git** es un sistema de control de versiones. Guarda el historial de todos los cambios del proyecto y permite volver a una versión anterior.
- **GitHub** es el servicio en línea donde se aloja el repositorio. Permite revisar los cambios del equipo mediante *pull requests*, registrar tareas con *issues* y automatizar verificaciones con *GitHub Actions*.

Repositorio: <https://github.com/CAMILABERROCAL/PixelVault-JSON>

## 2. Conceptos básicos

| Término | Significado |
|---|---|
| **Repositorio** | Carpeta del proyecto con todo su historial. |
| **Commit** | Un "punto de guardado": un conjunto de cambios con un mensaje que lo describe. |
| **Rama (branch)** | Línea de trabajo independiente. Permite cambiar cosas sin afectar la versión estable. |
| **Pull request (PR)** | Solicitud para integrar los cambios de una rama en otra, para que el equipo los revise. |
| **Merge** | Unir los cambios de una rama con otra. |
| **Conflicto** | Ocurre cuando dos ramas modifican las mismas líneas y Git no sabe cuál conservar. Se resuelve a mano. |
| **Clonar** | Descargar una copia del repositorio a tu computador. |

## 3. Ramas del proyecto

| Rama | Uso |
|---|---|
| `main` | Versión estable y final. No se trabaja directamente en ella. |
| `dev` | Integración de los avances del equipo. |
| `feature/<nombre>` | Rama personal de cada integrante. |

Ramas de las tareas asignadas: `feature/Camila`, `feature/diego`, `feature/jhair`, `feature/stiven` y `feature/alexander`.

## 4. Flujo de trabajo del equipo

```
rama personal  →  commit  →  push  →  pull request  →  revisión y checks  →  merge a main
```

1. Crear o cambiar a la rama personal.
2. Hacer los cambios y guardarlos con un *commit*.
3. Subir la rama a GitHub con *push*.
4. Abrir un *pull request* hacia `main` (o `dev`).
5. Esperar los *checks* de GitHub Actions y la revisión del equipo.
6. Hacer el *merge* cuando todo esté listo.

## 5. Comandos principales

```bash
# Descargar el repositorio
git clone https://github.com/CAMILABERROCAL/PixelVault-JSON.git
cd PixelVault-JSON

# Ver en qué rama estás y qué cambió
git branch
git status

# Crear una rama nueva y cambiarte a ella
git checkout -b feature/tu-nombre

# Cambiar a una rama que ya existe
git checkout feature/tu-nombre

# Traer los últimos cambios de la rama principal
git pull origin main

#
