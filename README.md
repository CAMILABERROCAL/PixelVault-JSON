<div align="center">

# 🎮 PixelVault
### Tu próxima aventura empieza aquí

Tienda web académica de videojuegos digitales con catálogo, carrito, cuentas de usuario y compras de demostración.

**Explora · Agrega al carrito · Inicia sesión · Simula tu compra**

[🚀 Instalación](#-puesta-en-marcha) · [🛒 Funcionalidades](#-qué-puedes-hacer) · [👥 Equipo](#-equipo-y-responsabilidades) · [🌿 Colaboración](#-cómo-trabajamos)

</div>

---

## 📌 ¿De qué trata nuestra página?

**PixelVault** permite explorar videojuegos, consultar sus características y precios, preparar un carrito y completar una compra simulada. También incluye un panel para que el administrador gestione el catálogo, las existencias y consulte los pedidos.

El proyecto sirve para practicar el desarrollo de una aplicación web completa: interfaz, API REST, autenticación, persistencia y trabajo colaborativo con GitHub.

> 💳 **Los pagos son de demostración:** no se cobra dinero ni se entregan licencias reales. Se pueden probar operaciones aprobadas y rechazadas.

## 🛒 ¿Qué puedes hacer?

| Área | Funciones actuales |
| --- | --- |
| 🎮 Catálogo público | Buscar por título o plataforma, filtrar por género, ordenar precios y consultar detalles. |
| 🛍️ Carrito | Agregar juegos, ajustar cantidades, eliminar productos y consultar el total sin iniciar sesión. |
| 🔐 Cuenta de cliente | Registrarse e iniciar sesión por correo. Para continuar al pago se requiere una sesión. |
| 💳 Compra simulada | Elegir tarjeta o Yape de prueba, simular aprobación o rechazo y validar stock en el servidor. |
| 📦 Mis pedidos | Consultar el historial privado de compras de la cuenta. Requiere iniciar sesión. |
| ⚙️ Administración | Iniciar sesión como ADMIN para crear, editar, ocultar o eliminar juegos y consultar pedidos. |
| 💾 Conservación de datos | Guardar catálogo, cuentas y pedidos en un archivo JSON entre reinicios. |

El carrito se conserva en el navegador durante el acceso a la cuenta. El administrador debe autenticarse antes de entrar al panel.

## 🧰 ¿Qué estamos usando y para qué?

| Tecnología | Uso en PixelVault |
| --- | --- |
| **Java 17** | Lenguaje del servidor y de las reglas de compra. |
| **Spring Boot 3.3.4** | Ejecutar la aplicación y exponer la API REST. |
| **Spring Security + BCrypt** | Controlar sesiones, permisos CLIENTE/ADMIN, protección CSRF y hashes de contraseñas. |
| **HTML + CSS + JavaScript** | Construir las páginas, los estilos y las interacciones del usuario. |
| **JSON** | Guardar videojuegos, cuentas y pedidos en el servidor, sin instalar MySQL. |
| **localStorage** | Conservar el carrito en el navegador del usuario. |
| **Maven** | Administrar dependencias, ejecutar pruebas y empaquetar el proyecto. |
| **Docker + Docker Compose** | Preparar la ejecución en contenedores con un volumen para los datos. |
| **Git + GitHub + GitHub Actions** | Organizar ramas y revisiones, y automatizar verificaciones del proyecto. |

### ¿Cómo se guardan los datos?

- **Servidor:** `datos/tienda.json` contiene videojuegos, cuentas con contraseñas protegidas y pedidos.
- **Navegador:** `localStorage` conserva el carrito en ese dispositivo.
- **Sesiones:** se mantienen en memoria; reiniciar el servidor requiere volver a iniciar sesión.
- **Repositorio:** incluye el código. Los datos locales de usuarios y pedidos quedan excluidos mediante `.gitignore`.

## 👥 Equipo y responsabilidades

Somos **cinco integrantes**. La siguiente tabla es el **plan de mejoras asignadas** sobre la versión base; no indica que esas tareas ya estén terminadas. El avance se registra en Issues, pull requests y el tablero del proyecto.

| Integrante | Rama de trabajo prevista | Módulo | Mejoras asignadas |
| --- | --- | --- | --- |
| **Camila** | `feature/Camila` | Carrito | Agregar la opción de vaciar el carrito, confirmar antes de borrar y mostrar el resultado. Verificar que cancelar conserve los productos y confirmar los elimine. |
| **Diego** | `feature/diego` | Catálogo | Agregar un botón para restablecer búsqueda, género y orden. Mejorar el mensaje sin resultados y su presentación en móvil. |
| **Jhair** | `feature/jhair` | Pedidos y pago | Permitir descargar un comprobante de demostración en TXT con el identificador del pedido. Mejorar la explicación del método de pago y el enlace de regreso al carrito. |
| **Stiven** | `feature/stiven` | Login y registro | Agregar controles accesibles para mostrar u ocultar contraseñas y una guía de longitud en el registro. |
| **Alexander** | `feature/alexander` | Ejecución y automatización | Mejorar Docker y Compose con comprobación de salud y documentación; agregar una verificación automática de sintaxis JavaScript. |

**Organización de archivos:** cada integrante prioriza las páginas de su módulo y archivos JavaScript/CSS propios. Los cambios en el archivo compartido `script.js` se coordinan antes de editarlo.

Docker, Compose y un workflow de verificación ya forman parte de la base. Las tareas del equipo amplían esos archivos y funcionalidades.

## 🌿 Cómo trabajamos

| Rama | Propósito |
| --- | --- |
| `main` | Versión integrada y comprobada del proyecto. |
| `dev` | Integración de las mejoras del equipo. |
| `feature/nombre` | Trabajo individual de cada integrante, creado desde `dev`. |

1. Crear **dos Issues por integrante**, con objetivos y criterios de aceptación.
2. Trabajar en la rama personal y registrar **cinco commits útiles por integrante**.
3. Subir los cambios y abrir un **pull request hacia `dev`**, vinculando los Issues correspondientes.
4. Pedir la revisión de otro integrante y comprobar las verificaciones automáticas.
5. Integrar conservando los commits individuales; usar **Create a merge commit**.
6. Probar `dev` y abrir el pull request hacia `main`.

El tablero se organiza en **Pendiente → En curso → En revisión → Terminado**. Los tags y releases identifican versiones verificadas; cada integrante prepara también sus Gists según la consigna del curso.

Para que GitHub atribuya los commits, cada persona usa su propia cuenta y un correo asociado a ella. El gráfico de contribuyentes refleja el historial integrado en la rama predeterminada; no representa un porcentaje de avance.

## 🚀 Puesta en marcha

### Ejecutar en Windows / VS Code

1. Descomprime y abre **esta carpeta**, la que contiene `pom.xml`.
2. Comprueba `java -version` y `mvn -version`. Necesitas un JDK 17 o superior compatible con Spring Boot 3 y Maven 3.9+. La compilación se realizó con Java 17. Si usas Java 22, Maven debe apuntar a ese JDK correctamente.
3. Desde la terminal del proyecto:

```powershell
mvn clean verify
mvn spring-boot:run
```

También puedes abrir `INICIAR.bat` con Java y Maven en el PATH.

4. Entra a **http://localhost:8081**. El catálogo y el carrito son públicos.
5. Para detener el servidor, presiona Ctrl+C en la terminal.

La primera ejecución requiere Internet para descargar dependencias Maven. No abras los HTML con Live Server: usa Spring Boot para que funcionen las API, las sesiones y el login. Los tres juegos iniciales tienen portadas locales; una imagen externa que agregues sí requiere conexión.

### Administrador de demostración

- Correo: **admin@pixelvault.local**
- Contraseña: **AdminDemo2026!**

Se crea al iniciar por primera vez. Entra desde **Administración** en la barra superior. Ninguna persona puede crear una cuenta ADMIN desde el registro público.

Para crear tus propias credenciales iniciales, configura estas variables **antes del primer inicio**:

```powershell
$env:PIXELVAULT_ADMIN_EMAIL="tu-correo@ejemplo.com"
$env:PIXELVAULT_ADMIN_PASSWORD="UnaClaveLargaDePrueba2026!"
mvn spring-boot:run
```

Se aplican solo cuando aún no existe `datos/tienda.json`; cambiarlas después no reemplaza la cuenta guardada. Usa una clave de al menos 12 caracteres para el administrador. La cuenta publicada es exclusivamente para una demostración local. Antes de exponer la aplicación a Internet, configura tus credenciales, HTTPS y las condiciones de hosting.

### Registro de clientes

El cliente explora, filtra y añade juegos al carrito sin una cuenta. Al pulsar **Continuar al pago**, si no tiene una sesión, se abre el login. Desde ahí puede crear su cuenta y luego ingresar; el carrito se conserva. La página Mis pedidos también requiere sesión.

## Funciones

- Catálogo: búsqueda por título/plataforma, filtro por género, orden de precios y detalle.
- Carrito público: cantidades, eliminación y resumen; persiste en el navegador mediante localStorage.
- Registro y login por correo, contraseñas con BCrypt y sesiones de Spring Security.
- CSRF habilitado para registro, login, cambios de inventario, compra y logout.
- Pago simulado: tarjeta de prueba o Yape de prueba, escenario aprobado o rechazado.
- Pedido: total calculado en el servidor, validación de stock, historial privado por usuario.
- Reintentos con la misma clave de pago no crean pedidos adicionales.
- Panel ADMIN: crear, editar, ocultar o eliminar juegos, administrar stock y ver pedidos.
- Persistencia conjunta de pedidos y stock en un único JSON mediante reemplazo atómico.
- Archivo dañado: la aplicación falla al arrancar y lo conserva; no lo borra ni lo sobrescribe silenciosamente.

## Pago simulado: alcance exacto

**No es una integración con una pasarela financiera real.** No cobra dinero, no solicita tarjeta, CVV, PIN ni claves, no genera un QR de Yape válido y no entrega licencias reales. El usuario elige un método de demostración y un escenario:

- Aprobado: se crea un pedido `PAGADO_DEMO` y se descuenta stock.
- Rechazado: no se crea el pedido ni se descuenta stock. El carrito sigue intacto.

Los precios enviados por el navegador no se usan como fuente del total: el servidor usa el catálogo vigente. Para integrar pagos reales después, hacen falta proveedor, credenciales, creación de pagos en backend y confirmación verificada mediante webhooks. No debe reutilizarse la selección de “aprobado” del simulador para confirmar dinero real.

El stock representa unidades digitales de demostración. La tabla de licencias de MySQL fue sustituida por un contador persistente; no se implementa la distribución de códigos activables.

## Archivos de datos y persistencia

En el primer inicio se crea:

```text
datos/
  tienda.json       # videojuegos, cuentas con hash y pedidos
  tienda.lock       # bloqueo de uso por una sola instancia
```

Un solo archivo de estado permite guardar compra y stock juntos. No borres `tienda.json` para actualizar el catálogo: usa el panel. Al reiniciar se conservan cuentas, cambios y pedidos. Las sesiones se guardan en memoria: después de reiniciar, los usuarios deben volver a iniciar sesión.

El carrito vive en el navegador/dispositivo donde se creó; no se sincroniza entre dispositivos. Los pedidos sí se guardan en el servidor y quedan asociados al correo de cada cuenta. Los pedidos conservan título y precio de compra aunque después se edite o elimine un juego.

Puedes cambiar la carpeta con `PIXELVAULT_DATA_DIR`:

```powershell
$env:PIXELVAULT_DATA_DIR="C:\PixelVaultDatos"
mvn spring-boot:run
```

Para hacer una copia de seguridad, detén el servidor y copia `tienda.json`. El directorio debe permitir escritura y reemplazos atómicos. La aplicación bloquea una segunda instancia que intente usar esa misma carpeta: es una solución académica para un solo servidor, no almacenamiento distribuido. Pedidos y existencias se procesan bajo exclusión mutua para evitar ventas concurrentes del último stock.

## Pruebas

```powershell
mvn test
mvn clean verify
```

Las pruebas usan carpetas temporales y no modifican `datos/` ni requieren MySQL. Cubren invitados, registro, contraseña protegida, sesiones, rol ADMIN, CSRF, precios, stock, pago rechazado, reintentos, concurrencia y reapertura del archivo. Revisa `VALIDACION.md` para el alcance de la verificación de entrega.

## Docker y Docker Compose

Necesitas Docker Desktop o Docker Engine con Compose. No necesitas MySQL ni Java/Maven en el host si ejecutas con Docker.

```powershell
docker compose up --build
```

Abre http://localhost:8081. El volumen `pixelvault_datos` conserva los datos al recrear el contenedor.

```powershell
docker compose down
```

`docker compose down -v` **elimina los datos del volumen**. No lo uses si deseas conservarlos.

Opcionalmente copia `.env.example` a `.env` y modifica las credenciales iniciales antes del primer inicio. El contenedor ejecuta con un usuario sin privilegios. Construye con Maven en una etapa separada.

## 🤝 Descargar el proyecto para colaborar

```powershell
git clone https://github.com/CAMILABERROCAL/PixelVault-JSON.git
cd PixelVault-JSON
git switch dev
git switch -c feature/TU-NOMBRE
```

Si tu rama ya existe en GitHub, después de clonar usa `git switch --track origin/feature/TU-NOMBRE` en lugar de crear otra. Reemplaza `TU-NOMBRE` por el nombre acordado en la tabla del equipo.

Antes de comenzar una tarea, actualiza tu rama e integra los cambios necesarios de `origin/dev`. Evita editar los mismos archivos simultáneamente sin coordinación.

`.github/workflows/verificar.yml` define las comprobaciones de Maven, Compose y construcción de imagen. Su resultado se consulta en la pestaña **Actions** del repositorio.

## Estructura

```text
src/main/java/com/utp/videojuegos/
  config/SecurityConfig.java        # sesiones, acceso y BCrypt
  controller/ShopController.java    # catálogo, cuentas y compra
  controller/ApiErrors.java         # respuestas de error
  model/Videojuego.java             # datos del producto
  model/ShopData.java               # cuentas, pedidos y estado
  repository/JsonStore.java         # lectura/escritura atómica
src/main/resources/static/
  index.html                       # catálogo público
  carrito.html                     # carrito sin login
  login.html / registro.html       # cuentas
  pago.html                        # pago de demostración con sesión
  pedidos.html                     # historial privado
  admin.html                       # panel protegido
  css/ / js/ / img/
src/test/                          # pruebas de integración
Dockerfile / compose.yaml
```

## Cambios respecto al avance original

- Eliminados los repositorios JPA, las entidades JPA, las dependencias MySQL/JWT sin uso y la configuración datasource.
- Conservado el modelo de videojuegos, las tres portadas y la identidad visual azul/oscura.
- Unificado el login por sesión; eliminado el endpoint paralelo que solo verificaba credenciales sin crear una sesión.
- Agregados el registro visible, carrito, checkout, pedidos y gestión de stock persistente.
- Corregidas las operaciones del administrador para enviar CSRF y validar los datos.
- Preparados README, GitHub Actions y contenedores.

Software educativo. No es una plataforma de pagos real ni un servicio de entrega de videojuegos licenciados.
