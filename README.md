<div align="center">

# 📚 AULALIBRO

### Un libro, muchas posibilidades

Una biblioteca escolar en línea para explorar el catálogo, seleccionar libros y solicitarlos en préstamo.

<br>

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JSON](https://img.shields.io/badge/JSON-292929?style=for-the-badge&logo=json&logoColor=white)

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

<br>

**📖 Explora  ·  ✅ Selecciona  ·  🔐 Ingresa  ·  📦 Consulta tus préstamos**

</div>

---

## 📑 Contenido

1. [Conoce AulaLibro](#-conoce-aulalibro)
2. [¿Qué ofrece la página?](#-qué-ofrece-la-página)
3. [Tecnologías utilizadas](#-tecnologías-utilizadas)
4. [Nuestro equipo y responsabilidades](#-nuestro-equipo-y-responsabilidades)
5. [¿Cómo conservamos la información?](#-cómo-conservamos-la-información)
6. [Ejecutar la aplicación](#-ejecutar-la-aplicación)
7. [Pruebas y verificación](#-pruebas-y-verificación)
8. [Git: trabajo colaborativo](#-git-trabajo-colaborativo)
9. [GitHub Actions](#-github-actions)
10. [Docker](#-docker)
11. [Kubernetes](#-kubernetes)
12. [Alojamiento en línea](#-alojamiento-en-línea)
13. [Documentación del proyecto](#-documentación-del-proyecto)
14. [Evidencias y cumplimiento de requisitos](#-evidencias-y-cumplimiento-de-requisitos)

---

## 🌟 Conoce AulaLibro

**AulaLibro** es un proyecto académico que representa la biblioteca de una escuela. Permite consultar el catálogo de libros, seleccionar los que se necesitan y solicitarlos en préstamo por **7 días**.

También cuenta con un panel de administración para gestionar el catálogo, controlar los ejemplares disponibles y registrar la devolución de los préstamos.

Nuestro objetivo es aplicar el desarrollo web y el trabajo en equipo mediante una aplicación que conecta una interfaz interactiva con un servidor Spring Boot y un almacenamiento en archivos JSON. Además, el proyecto se versiona con **Git**, se verifica automáticamente con **GitHub Actions**, se empaqueta con **Docker** y se despliega en **Kubernetes**.

> 💡 Puedes explorar el catálogo y preparar tu selección sin iniciar sesión. Para solicitar el préstamo necesitas ingresar a tu cuenta.

---

## 📖 ¿Qué ofrece la página?

|    | Funcionalidad | ¿Qué permite hacer? |
|:--:|---|---|
| 📚 | **Catálogo de libros** | Explorar los títulos y consultar su descripción, género, autor o plataforma, y los ejemplares disponibles. |
| 🔎 | **Búsqueda y filtros** | Encontrar libros y ordenar los resultados. |
| ✅ | **Mi selección de libros** | Agregar libros, modificar cantidades, quitar uno o vaciar toda la selección con confirmación. Se conserva en el navegador. |
| 👤 | **Registro e inicio de sesión** | Crear una cuenta y acceder para solicitar préstamos. |
| 📦 | **Mis préstamos** | Consultar los préstamos de la cuenta y su estado: `ACTIVO`, `VENCIDO` o `DEVUELTO`. |
| ⏱️ | **Plazo de 7 días** | Cada préstamo tiene fecha límite; si se pasa, se muestra como vencido. |
| 🛠️ | **Panel de administración** | Crear, editar, ocultar o eliminar libros, actualizar ejemplares y registrar devoluciones. Acceso protegido por rol. |

**Reglas del préstamo**

- Máximo **99 ejemplares** por título y **50 líneas** por solicitud.
- Un libro **sin ejemplares suficientes** no se puede solicitar.
- Un libro con **préstamos pendientes** no se puede eliminar (se puede ocultar).
- Al registrar la devolución, los ejemplares vuelven al inventario **una sola vez**.
- Repetir la misma solicitud (por ejemplo, por un doble clic) **no duplica** el préstamo.

---

## 💻 Tecnologías utilizadas

### ⚙️ Servidor y seguridad

| Tecnología | ¿Para qué la usamos? |
|---|---|
| ☕ **Java 17** | Lógica de la aplicación y reglas de préstamo. |
| 🍃 **Spring Boot 3.3.4** | Servidor web y API REST. |
| 🔐 **Spring Security** | Inicio de sesión, protección CSRF y permisos de usuario y administrador. |
| 🛡️ **BCrypt** | Protección de contraseñas mediante hashes. |
| ❤️ **Spring Actuator** | Endpoint `/actuator/health` para comprobar que la aplicación responde. |
| 📦 **Maven** | Dependencias, pruebas y compilación. |

### 🎨 Interfaz y almacenamiento

| Tecnología | ¿Para qué la usamos? |
|---|---|
| 🧱 **HTML** | Organizar el contenido de las páginas. |
| 🎨 **CSS** | Estilo y diseño adaptable a distintos tamaños de pantalla. |
| ⚡ **JavaScript** | Interacciones, selección de libros y solicitudes al servidor. |
| 🗂️ **JSON** | Conservar libros, cuentas y préstamos en archivos del servidor. |
| 🛒 **localStorage** | Mantener la selección de libros en el navegador. |

### 🤝 Herramientas de colaboración y despliegue

| Herramienta | ¿Para qué la usamos? |
|---|---|
| **Git y GitHub** | Control de versiones, ramas, pull requests e issues. |
| **GitHub Actions** | Automatizar pruebas y verificaciones en cada cambio. |
| **Docker y Docker Compose** | Empaquetar y ejecutar la aplicación en contenedores. |
| **Kubernetes (Docker Desktop)** | Desplegar la aplicación con un Deployment y un Service. |

---

## 👥 Nuestro equipo y responsabilidades

| Integrante | Área | Qué hace | Entregables |
|---|---|---|---|
| 🌐 **Camila** | Web en línea | Publicar la página con un enlace público que abra y permita usarla. | Enlace público y sección de alojamiento |
| ⚙️ **Alexander** | Docker | Revisar y adaptar el `Dockerfile` y Compose al proyecto; comprobar que construye y arranca. | `Dockerfile`, `compose.yaml`, `.dockerignore` y documentación de Docker |
| ☸️ **Diego** | Kubernetes en Docker Desktop | Preparar un Deployment y un Service, desplegarlos y demostrar que la web responde. | Carpeta `k8s/` y documentación de Kubernetes |
| 🧪 **Jhair** | GitHub Actions y pruebas | Automatizar verificaciones y documentar cómo comprobar filtros y detalles. | Workflows, carpeta `pruebas/` y documentación de Actions |
| 📝 **Stiven** | Documentación final | Ordenar la documentación, explicar Git y reunir las secciones y evidencias del equipo. | Carpeta `docs/` y este `README.md` |

> Cada integrante trabaja en su propia rama (`feature/<nombre>`). Su avance se registra en los **Issues** y **pull requests** del repositorio.

---

## 💾 ¿Cómo conservamos la información?

AulaLibro usa **archivos JSON** como almacenamiento del servidor:

- 📚 **Libros:** catálogo, descripciones y ejemplares disponibles.
- 👤 **Cuentas:** datos de los usuarios y contraseñas protegidas con hash BCrypt.
- 📦 **Préstamos:** libros solicitados, fecha, fecha límite, estado y fecha de devolución.
- ✅ **Selección de libros:** se guarda aparte, en el navegador de cada persona.

Los datos del servidor se generan en `datos/tienda.json` y permanecen después de reiniciar la aplicación. La carpeta `datos/` está excluida del repositorio mediante `.gitignore`.

Medidas que protegen el archivo:

- Se escribe en un archivo temporal y luego se reemplaza (escritura atómica).
- Un archivo de bloqueo impide que dos instancias usen la misma carpeta de datos.
- Si el JSON está dañado, la aplicación **no lo sobrescribe** y se detiene con un mensaje.

---

## 🚀 Ejecutar la aplicación

### Opción 1: con Maven

Necesitas **JDK 17 y Maven 3.9 o superior**. Desde la carpeta que contiene `pom.xml`:

```powershell
mvn clean verify
```

Después inicia la aplicación:

```powershell
mvn spring-boot:run
```

Abre en tu navegador: **http://localhost:8081**

Para detener la aplicación, presiona **Ctrl + C**. En Windows también puedes usar `INICIAR.bat`.

### Opción 2: con Docker Compose

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Antes de iniciar, abre `.env` y define tus propias credenciales de administrador (clave de **al menos 12 caracteres**):

```dotenv
PIXELVAULT_ADMIN_EMAIL=tu-correo@ejemplo.local
PIXELVAULT_ADMIN_PASSWORD=REEMPLAZAR_POR_UNA_CLAVE_SEGURA
```

> ⚠️ El archivo `.env` **nunca** debe subirse a GitHub. Estas credenciales solo se usan cuando se crea por primera vez el archivo de datos.

### Variables de configuración

| Variable | Para qué sirve | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `8081` |
| `PIXELVAULT_DATA_DIR` | Carpeta donde se guarda `tienda.json` | `./datos` |
| `PIXELVAULT_ADMIN_EMAIL` | Correo del administrador inicial | ver `.env.example` |
| `PIXELVAULT_ADMIN_PASSWORD` | Clave del administrador inicial (mín. 12 caracteres) | definir en `.env` |

---

## 🧪 Pruebas y verificación

| Qué se comprueba | Cómo se ejecuta |
|---|---|
| Pruebas de integración del servidor (acceso, roles, CSRF, préstamos, devoluciones, stock, concurrencia y archivo JSON) | `mvn clean verify` |
| Sintaxis de los scripts de JavaScript | `node --check src/main/resources/static/js/script.js` |
| Selección y vaciado de libros | `node --test pruebas/seleccion-libros.test.cjs` |
| Cancelar y confirmar el vaciado de la selección | `pruebas/carrito-cancelacion.js` y `pruebas/carrito-confirmacion.js`, pegados en la consola del navegador |
| Salud de la aplicación | `http://localhost:8081/actuator/health` debe responder `{"status":"UP"}` |

Detalle de la última validación en [`VALIDACION.md`](VALIDACION.md).

---

## 🌿 Git: trabajo colaborativo

**Git** es el sistema que guarda el historial del proyecto, y **GitHub** es donde se aloja y se revisa el trabajo en equipo.

### Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable y final. No se trabaja directamente en ella. |
| `dev` | Integración de los avances del equipo. |
| `feature/<nombre>` | Rama personal de cada integrante (por ejemplo, `feature/diego`). |

### Flujo de trabajo

```bash
# 1. Clonar el repositorio
git clone https://github.com/CAMILABERROCAL/PixelVault-JSON.git
cd PixelVault-JSON

# 2. Crear (o cambiar a) tu rama
git checkout -b feature/tu-nombre

# 3. Hacer cambios y revisar qué se modificó
git status

# 4. Guardar los cambios
git add .
git commit -m "Describe brevemente qué cambiaste"

# 5. Subir tu rama
git push origin feature/tu-nombre
```

Después, en GitHub se abre un **pull request** hacia `dev`. Otra persona del equipo revisa los cambios y, cuando los checks de GitHub Actions están en verde, se hace el **merge**. Al final, `dev` se integra a `main`.

### Buenas prácticas del equipo

- Un `commit` por cambio con un mensaje claro.
- Antes de empezar: `git pull origin dev` para traer lo último.
- No subir contraseñas, `.env` ni la carpeta `datos/`.
- Cada tarea se relaciona con un **Issue**.

> 📸 **Evidencia pendiente:** captura del historial de commits, de las ramas y de un pull request integrado.

---

## ⚡ GitHub Actions

Los workflows están en `.github/workflows/` y se ejecutan automáticamente al subir cambios o abrir un pull request.

| Workflow | ¿Qué verifica? |
|---|---|
| `verificar.yml` | Pruebas y empaquetado con `mvn verify`, validación de Compose y construcción de la imagen Docker. |
| `verificar-docker.yml` | Levanta la aplicación con Docker Compose y espera que `/actuator/health` responda `UP`. |
| `docker-build.yml` | Construye la imagen Docker cuando cambian los archivos de Docker. |
| `verificar-pedidos-pago.yml` | Pruebas de integración y sintaxis de los scripts de pedidos y pago. |
| `verificar-seleccion.yml` | Sintaxis de JavaScript y pruebas de la selección y vaciado de libros. |

Para ver los resultados: pestaña **Actions** del repositorio → elegir el workflow → abrir la última ejecución.

> 📸 **Evidencia pendiente:** captura de la pestaña Actions con ejecuciones en verde.

---

## 🐳 Docker

El proyecto incluye:

- `Dockerfile`: compila y prueba el proyecto con Maven y genera una imagen ligera con Java 17 que corre con un usuario sin privilegios.
- `compose.yaml`: define el servicio, el puerto `8081`, las variables de entorno y un volumen para conservar los datos.
- `.dockerignore`: evita copiar archivos innecesarios a la imagen.

### Comandos

```bash
docker compose config --quiet     # validar la configuración
docker compose up --build         # construir e iniciar
docker compose ps                 # ver el estado
docker compose logs               # ver los registros
docker compose down               # detener
```

La aplicación queda disponible en **http://localhost:8081**.

Guía completa: [`docs/ejecucion-docker.md`](docs/ejecucion-docker.md).

> 📸 **Evidencia pendiente:** captura de `docker compose up --build` y de `docker compose ps` con el contenedor en ejecución.

---

## ☸️ Kubernetes

La aplicación se despliega en el **Kubernetes de Docker Desktop**, con al menos un **Pod** (creado por un Deployment) y un **Service** que lo expone.

> ⚠️ **PENDIENTE (Diego, con Alexander):** los archivos van en la carpeta `k8s/`. Los comandos de abajo son la guía; ajusta los nombres cuando existan los manifiestos reales.

### Requisitos

1. Docker Desktop con Kubernetes activado (Settings → Kubernetes → Enable).
2. La imagen construida en local (en coordinación con Alexander):

```bash
docker build -t aulalibro:1.0 .
```

### Despliegue

```bash
kubectl config use-context docker-desktop
kubectl apply -f k8s/
kubectl get deployments
kubectl get pods
kubectl get services
```

### Comprobar que la web responde

```bash
kubectl port-forward service/<nombre-del-service> 8081:8081
```

Abrir **http://localhost:8081** y verificar también `http://localhost:8081/actuator/health`.

### Limpiar

```bash
kubectl delete -f k8s/
```

Guía completa: `docs/kubernetes.md` *(por crear)*.

> 📸 **Evidencia pendiente:** captura de `kubectl get pods` y `kubectl get services` y de la web abierta desde Kubernetes.

---

## 🌍 Alojamiento en línea

> ⚠️ **PENDIENTE (Camila):** completar con el servicio elegido y el enlace real.

| Dato | Valor |
|---|---|
| 🔗 Enlace público | `https://________________` |
| ☁️ Servicio de alojamiento | `________________` |
| 📅 Fecha de publicación | `__ / __ / ____` |

**Cómo se publicó** (pasos con los que se desplegó):

1. `________________`
2. `________________`
3. `________________`

El servidor lee el puerto de la variable `PORT`, por lo que funciona en servicios de alojamiento que lo asignan automáticamente. Hay que definir `PIXELVAULT_ADMIN_EMAIL` y `PIXELVAULT_ADMIN_PASSWORD` en la configuración del servicio.

> ⚠️ En muchos servicios gratuitos el disco no es permanente: los datos de `tienda.json` pueden reiniciarse al reiniciar el servicio. Hay que indicarlo en la presentación.

> 📸 **Evidencia pendiente:** captura de la página abierta desde el enlace público y de un préstamo realizado en línea.

---

## 📂 Documentación del proyecto

| Documento | Contenido | Estado |
|---|---|---|
| [`docs/descripcion-proyecto.md`](docs/descripcion-proyecto.md) | Descripción y objetivo del proyecto | ✅ Existe (actualizar a AulaLibro) |
| [`docs/ejecucion-docker.md`](docs/ejecucion-docker.md) | Ejecución con Docker | ✅ Existe |
| `docs/git.md` | Explicación de Git y flujo del equipo | ⏳ Por crear |
| `docs/github-actions.md` | Workflows y cómo leer sus resultados | ⏳ Por crear |
| `docs/kubernetes.md` | Despliegue en Kubernetes | ⏳ Por crear |
| `docs/alojamiento.md` | Dónde y cómo se publicó la web | ⏳ Por crear |
| `docs/evidencias/` | Capturas reales de cada parte | ⏳ Por crear |
| [`VALIDACION.md`](VALIDACION.md) | Resultado de las pruebas | ✅ Existe (actualizar) |

---

## ✅ Evidencias y cumplimiento de requisitos

| Requisito | Qué debemos mostrar | Responsable | Estado |
|---|---|---|:--:|
| **Web en línea** (3 puntos) | Enlace público que abra y permita utilizar la página | Camila | ⏳ |
| **Kubernetes** (5 puntos) | Aplicación funcionando en Kubernetes de Docker Desktop, con al menos un Pod y un Service | Diego, con Alexander | ⏳ |
| **Borrador de documentación** (5 puntos) | Explicación de Git, Actions, Docker, Kubernetes y el alojamiento utilizado, con comandos y evidencias reales | Stiven organiza; todos aportan | ⏳ |

**Evidencias que se deben reunir en `docs/evidencias/`:**

- [ ] Historial de commits, ramas y un pull request integrado (Git)
- [ ] Pestaña Actions con ejecuciones en verde
- [ ] `docker compose up --build` y `docker compose ps`
- [ ] `kubectl get pods` y `kubectl get services`
- [ ] Web abierta desde Kubernetes
- [ ] Web abierta desde el enlace público

---

<div align="center">

**AulaLibro** · Proyecto académico · Un libro, muchas posibilidades.

</div>
