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

## Preparación del archivo .env

Antes de iniciar la aplicación, es necesario configurar las variables de entorno.

En PowerShell, desde la carpeta principal del proyecto, ejecutar:

```powershell
Copy-Item .env.example .env
```

Después, abrir el archivo `.env` y configurar:

```dotenv
PIXELVAULT_ADMIN_EMAIL=admin@ejemplo.local
PIXELVAULT_ADMIN_PASSWORD=REEMPLAZAR_POR_UNA_CLAVE_SEGURA
```

Los valores anteriores son ejemplos. Se deben establecer credenciales propias antes de ejecutar la aplicación.

El archivo `.env` no debe subirse a GitHub.

Para verificar la configuración:

```bash
docker compose config --quiet
```

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