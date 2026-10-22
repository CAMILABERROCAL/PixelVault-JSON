# PixelVault — tienda de videojuegos sin MySQL

Proyecto académico basado en el avance original de PixelVault. Backend Java 17 + Spring Boot 3.3.4 y frontend HTML, CSS y JavaScript. Guarda videojuegos, cuentas y pedidos en archivos JSON. No utiliza Scala, Prolog, JPA, MySQL ni una base de datos en memoria.

## Ejecutar en Windows / VS Code

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

## Subir a un repositorio nuevo

Este ZIP no contiene historial Git ni datos de usuarios. La carpeta `datos/`, `.env`, `target/` y los archivos locales del editor están excluidos por `.gitignore`.

1. Crea un repositorio **vacío** en GitHub.
2. Desde la carpeta del proyecto, reemplaza la URL del ejemplo por la de tu repositorio:

```powershell
git init
git add .
git commit -m "feat: tienda PixelVault con JSON, carrito, login y pago simulado"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

`.github/workflows/verificar.yml` ejecuta pruebas, empaquetado, validación de Compose y construcción de imagen. No se ha creado ni publicado ningún repositorio automáticamente. Los registros nuevos de la tienda no se suben automáticamente a GitHub; permanecen en la carpeta de datos de cada instalación.

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
