<div align="center">

# 🎮 PIXELVAULT

### Tu próxima aventura empieza aquí

Una tienda web de videojuegos digitales para explorar, elegir y preparar tu próxima compra.

<br>

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JSON](https://img.shields.io/badge/JSON-292929?style=for-the-badge&logo=json&logoColor=white)

<br>

**🎮 Explora  ·  🛒 Elige  ·  🔐 Ingresa  ·  📦 Consulta tus pedidos**

</div>

---

## 🌟 Conoce PixelVault

**PixelVault** es un proyecto académico que representa una tienda de videojuegos digitales. Permite consultar el catálogo, agregar productos al carrito y completar una compra de demostración.

También cuenta con un espacio de administración para gestionar los videojuegos, actualizar las existencias y consultar los pedidos realizados.

Nuestro objetivo es aplicar el desarrollo web y el trabajo en equipo mediante una aplicación que conecta una interfaz interactiva con un servidor y almacenamiento en archivos JSON.

<br>

## 🕹️ ¿Qué ofrece nuestra página?

| | Funcionalidad | ¿Qué permite hacer? |
| :---: | --- | --- |
| 🎮 | **Catálogo de videojuegos** | Explorar títulos y consultar su descripción, plataforma, género y precio. |
| 🔎 | **Búsqueda y filtros** | Encontrar videojuegos y ordenar los resultados por precio. |
| 🛒 | **Carrito de compras** | Agregar productos, modificar cantidades y revisar el total. |
| 👤 | **Registro e inicio de sesión** | Crear una cuenta y acceder para continuar al pago. |
| 💳 | **Compra de demostración** | Probar un pago aprobado o rechazado mediante tarjeta o Yape de prueba. |
| 📦 | **Historial de pedidos** | Consultar las compras asociadas a la cuenta del cliente. |
| 🛠️ | **Panel de administración** | Gestionar videojuegos, precios, disponibilidad y pedidos con acceso protegido. |

> 💡 Puedes explorar el catálogo y preparar tu carrito sin iniciar sesión. Para continuar al pago necesitas ingresar a tu cuenta. Las operaciones de pago son simuladas y no generan cobros reales.

<br>

## 💻 Tecnologías utilizadas

### ⚙️ Servidor y seguridad

| Tecnología | ¿Para qué la usamos? |
| --- | --- |
| ☕ **Java 17** | Desarrollar la lógica de la aplicación y las reglas de compra. |
| 🍃 **Spring Boot 3.3.4** | Ejecutar el servidor y conectar la interfaz con la API REST. |
| 🔐 **Spring Security** | Controlar el inicio de sesión y los permisos del cliente y administrador. |
| 🛡️ **BCrypt** | Proteger las contraseñas mediante hashes. |
| 📦 **Maven** | Gestionar las dependencias, ejecutar pruebas y compilar el proyecto. |

### 🎨 Interfaz y almacenamiento

| Tecnología | ¿Para qué la usamos? |
| --- | --- |
| 🧱 **HTML** | Organizar el contenido de las páginas. |
| 🎨 **CSS** | Dar estilo a la tienda y adaptar las pantallas a distintos tamaños. |
| ⚡ **JavaScript** | Gestionar las interacciones, el carrito y las solicitudes al servidor. |
| 🗂️ **JSON** | Conservar videojuegos, cuentas y pedidos en archivos del servidor. |
| 🛒 **localStorage** | Mantener el carrito guardado en el navegador. |

### 🤝 Herramientas de colaboración

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Utilizamos Git y GitHub para organizar los cambios de cada integrante, revisar aportes e integrar las mejoras. GitHub Actions permite automatizar verificaciones y Docker facilita preparar la ejecución en contenedores.

<br>

## 👥 Nuestro equipo

Las siguientes responsabilidades corresponden a las mejoras asignadas sobre la versión inicial. Su avance se registra en los Issues y pull requests del repositorio.

| Integrante | Área asignada | Responsabilidades | Rama |
| --- | --- | --- | --- |
| 🛒 **Camila** | Carrito de compras | Agregar la opción de vaciar el carrito con confirmación y mensajes. Comprobar que cancelar conserve los productos y confirmar los elimine. | `feature/Camila` |
| 🎮 **Diego** | Catálogo | Agregar un botón para restablecer los filtros, mejorar el mensaje sin coincidencias y ajustar la presentación en móvil. | `feature/diego` |
| 🧾 **Jhair** | Pedidos y pago | Agregar la descarga de un comprobante de demostración en TXT y mejorar la explicación de los métodos de pago y el regreso al carrito. | `feature/jhair` |
| 🔐 **Stiven** | Login y registro | Agregar controles accesibles para mostrar u ocultar contraseñas e incorporar una guía de longitud al registrarse. | `feature/stiven` |
| ⚙️ **Alexander** | Ejecución y automatización | Mejorar la comprobación de salud en Docker y Compose, agregar la verificación de sintaxis JavaScript y actualizar las instrucciones de ejecución. | `feature/alexander` |

<br>

## 💾 ¿Cómo conservamos la información?

**PixelVault utiliza archivos JSON como almacenamiento del servidor.**

- 🎮 **Videojuegos:** información del catálogo, precios y existencias.
- 👤 **Cuentas:** datos de los usuarios y contraseñas protegidas mediante hashes.
- 📦 **Pedidos:** detalle de las compras de demostración realizadas.
- 🛒 **Carrito:** se conserva por separado en el navegador del usuario.

Los datos del servidor se generan en `datos/tienda.json` y permanecen disponibles después de reiniciar la aplicación. Esta carpeta está excluida del repositorio mediante `.gitignore`.

<br>

## 🚀 Ejecutar la aplicación

Necesitas **JDK 17 y Maven 3.9 o superior**.

Desde la carpeta que contiene `pom.xml`, ejecuta:

```powershell
mvn clean verify
mvn spring-boot:run
