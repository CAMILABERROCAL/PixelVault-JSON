  # Descripción del proyecto AulaLibro

## ¿Qué es AulaLibro?

**AulaLibro** es una aplicación web que representa la biblioteca de una escuela. Permite consultar el catálogo de libros, seleccionar los que se necesitan y solicitarlos en préstamo por **7 días**.

También cuenta con un panel de administración para gestionar el catálogo, controlar los ejemplares disponibles y registrar la devolución de los préstamos.

## Objetivo del proyecto

Aplicar el desarrollo web y el trabajo en equipo mediante una aplicación que conecta una interfaz interactiva con un servidor Spring Boot y un almacenamiento en archivos JSON, y que se versiona con Git, se verifica con GitHub Actions, se empaqueta con Docker y se despliega en Kubernetes.

## ¿Qué permite hacer?

- Explorar el catálogo y consultar los ejemplares disponibles.
- Buscar y filtrar libros.
- Armar una selección de libros, modificar cantidades y vaciarla con confirmación.
- Registrarse e iniciar sesión.
- Solicitar préstamos y consultar su estado: `ACTIVO`, `VENCIDO` o `DEVUELTO`.
- Administrar libros, ejemplares y devoluciones desde un panel protegido por rol.

## Tecnologías utilizadas

| Área | Tecnologías |
|---|---|
| Servidor | Java 17, Spring Boot 3.3.4, Spring Security (BCrypt y CSRF), Spring Actuator, Maven |
| Interfaz | HTML, CSS, JavaScript |
| Almacenamiento | Archivos JSON en el servidor y `localStorage` en el navegador |
| Colaboración | Git y GitHub |
| Automatización | GitHub Actions |
| Contenedores | Docker y Docker Compose |
| Orquestación | Kubernetes (Docker Desktop) |

## Equipo y responsabilidades

| Integrante | Área |
|---|---|
| Camila | Web en línea: enlace público y alojamiento |
| Alexander | Docker: `Dockerfile`, `compose.yaml` y `.dockerignore` |
| Diego | Kubernetes: carpeta `k8s/` con Deployment y Service |
| Jhair | GitHub Actions y pruebas |
| Stiven | Documentación final: carpeta `docs/` y `README.md` |

## Trabajo colaborativo

El proyecto utiliza GitHub para gestionar el desarrollo en equipo. Cada integrante trabaja en una rama independiente (`feature/<nombre>`) para evitar modificaciones directas en `main`. Los cambios se registran mediante *commits* y se integran con *pull requests* revisados por el equipo y verificados por GitHub Actions.

Más detalle y un ejemplo real en [`git.md`](git.md).

## Documentación relacionada

- [`git.md`](git.md): Git, ramas, flujo del equipo y ejemplo real.
- [`ejecucion-docker.md`](ejecucion-docker.md): ejecución con Docker.
- [`../README.md`](../README.md): visión general y cómo ejecutar el proyecto.
