# Validación de entrega — 22 de octubre de 2026

## Compilación y pruebas

- Java 17, Maven 3.9.9, Spring Boot 3.3.4.
- `mvn verify`: **BUILD SUCCESS**.
- 9 pruebas de integración, 0 fallos, 0 errores, 0 omitidas.
- `node --check src/main/resources/static/js/script.js`: sin errores de sintaxis.
- No se requirió un servidor de base de datos.

Las pruebas comprueban: navegación pública y restricciones de pago/admin; registro y BCrypt; login y logout por sesión; CSRF; acceso de roles; edición y validación de stock/precios; total calculado en servidor; reintentos idempotentes; aislamiento de pedidos entre usuarios; rechazo de pago y stock insuficiente sin modificar el archivo; dos compras concurrentes del último ejemplar; entradas vacías/nulas; reapertura del JSON y conservación de un archivo dañado sin sobrescribirlo.

## Flujo real en navegador Chromium

Comprobado contra la aplicación Spring Boot ejecutándose:

1. Abrir catálogo y ver los tres juegos iniciales.
2. Agregar al carrito sin cuenta; recargar y conservar el carrito.
3. Ir a pagar y recibir la pantalla de login.
4. Crear una cuenta de cliente e iniciar sesión; conservar el carrito y volver al pago.
5. Simular pago rechazado: informar el error y conservar el carrito.
6. Simular pago aprobado: mostrar el pedido confirmado y vaciar el carrito.
7. Cerrar sesión; solicitar admin y recibir el login.
8. Iniciar como administrador y abrir el panel.
9. Crear y eliminar un juego con caracteres `< > &` en el título.
10. Revisar catálogo en ancho móvil de 390 px, sin desbordamiento horizontal.

No se registraron errores de JavaScript durante ese recorrido. Se inspeccionaron visualmente las vistas de catálogo en escritorio y móvil. Los datos usados para verificar fueron temporales y no están en este ZIP.

## Límites de la verificación

- La pasarela es **simulada**. No se realizaron cobros reales ni conexiones a servicios financieros.
- El ZIP contiene el código fuente; no incluye `target/`, cuentas de prueba generadas ni el directorio de datos de las pruebas.
- Dockerfile y Compose están incluidos. No se ejecutó la construcción Docker en este entorno porque no dispone de Docker; la Action preparada incluye esa comprobación al subir el proyecto.
- La Action se proporciona como código. Aún no se ha ejecutado en un repositorio de GitHub nuevo.
- No se ha desplegado la tienda en un hosting público ni se ha creado un repositorio.
