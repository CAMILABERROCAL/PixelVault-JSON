# Ejecución de PixelVault-JSON con Docker

## Objetivo

Documentar el proceso de ejecución del proyecto PixelVault-JSON mediante Docker, facilitando su configuración y despliegue en diferentes equipos.

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Git.
- Docker Desktop.
- Docker Compose, incluido en Docker Desktop.
- Acceso al repositorio PixelVault-JSON.

## Archivos de configuración

El proyecto contiene los siguientes archivos:

- `Dockerfile`: define las instrucciones para construir la imagen del aplicativo.
- `compose.yaml`: permite configurar e iniciar los servicios del proyecto.
- `.dockerignore`: excluye archivos innecesarios durante la construcción de la imagen.

## Construcción y ejecución

Desde la carpeta principal del proyecto, ejecutar:

```bash
docker compose up --build
```

Este comando construye las imágenes necesarias e inicia los servicios definidos en `compose.yaml`.

## Consultar el estado de los servicios

```bash
docker compose ps
```

## Consultar los registros

```bash
docker compose logs
```

## Detener los servicios

```bash
docker compose down
```

## Observaciones

Antes de ejecutar el aplicativo, se debe verificar que Docker Desktop esté iniciado y que las variables de entorno requeridas estén configuradas.

Los puertos y servicios disponibles dependen de la configuración definida en `compose.yaml`.