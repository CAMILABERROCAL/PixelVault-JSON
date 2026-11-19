# Ejecución del ranking de colegios con Docker

## 1. Objetivo

En esta parte del proyecto se utilizó Docker para ejecutar la página web del ranking de colegios de Villa El Salvador sin necesidad de instalar un servidor web manualmente.

La finalidad es facilitar la ejecución del frontend y permitir que otros integrantes del equipo puedan utilizar la misma configuración.

## 2. Archivos utilizados

### Dockerfile.web

Este archivo permite construir una imagen Docker utilizando Nginx como servidor web.

Nginx se encarga de mostrar los archivos HTML, CSS, JavaScript y JSON del ranking de colegios.

### compose.yaml

Este archivo permite administrar los servicios Docker del proyecto.

Se agregó el servicio `ranking-colegios`, que ejecuta el frontend y utiliza el puerto 8082 de nuestra computadora.

También se mantiene el servicio `pixelvault` del proyecto anterior.

### .dockerignore

Este archivo permite excluir archivos innecesarios del contexto de construcción de Docker, como archivos temporales, configuraciones del editor y credenciales.

## 3. Comandos utilizados

### Validar la configuración

```powershell
docker compose config --quiet
```

Este comando comprueba que la configuración de Docker Compose sea válida.

### Construir las imágenes

```powershell
docker compose build
```

Permite construir las imágenes Docker utilizando los archivos de configuración del proyecto.

### Iniciar el ranking

```powershell
docker compose up -d ranking-colegios
```

Inicia el servicio del ranking de colegios en segundo plano.

### Comprobar los contenedores

```powershell
docker compose ps
```

Muestra los contenedores y permite comprobar si se encuentran en ejecución.

## 4. Resultado obtenido

Se logró construir y ejecutar correctamente el contenedor del ranking de colegios.

La página web se visualizó desde el navegador mediante la dirección:

http://localhost:8082

Se comprobó que la página mostraba las tarjetas de colegios y las opciones de búsqueda y filtrado.

## 5. Relación con Kubernetes

La configuración realizada con Docker sirve como base para el despliegue posterior en Kubernetes.

El integrante encargado de Kubernetes podrá utilizar una imagen del frontend para configurar un Deployment y un Service.

## 6. Evidencias

En esta sección se agregarán las capturas de:

- Construcción exitosa de la imagen Docker.
- Ejecución de los contenedores mediante `docker compose ps`.
- Ranking de colegios funcionando en el navegador.
- Pull Request de Docker integrado en GitHub.

## 7. Conclusión

Con Docker se logró ejecutar el frontend del ranking de colegios de manera independiente, utilizando Nginx como servidor web.

Esta configuración facilita las pruebas del proyecto y permite preparar su posterior despliegue mediante Kubernetes.
