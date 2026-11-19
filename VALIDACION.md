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


## Mejoras de pedidos y pago

Cambios solo en el navegador: `js/pedidos-mejoras.js`, `js/pago-mejoras.js`, `pedidos.html` y `pago.html`. No se modificó `script.js` ni el servidor.

### Qué se agregó

- **Comprobante TXT:** cada pedido de "Mis pedidos" tiene el botón "Descargar comprobante (TXT)". El archivo incluye número de pedido, fecha, cliente, método de pago, productos, cantidades y total, e indica que no es un comprobante fiscal ni un cobro real. El panel de administración no muestra el botón.
- **Métodos de pago:** en la pantalla de pago se explica qué hace la tarjeta de prueba y Yape de prueba, y qué ocurre en el escenario aprobado y en el rechazado. El texto cambia al elegir otra opción.
- **Regreso al carrito:** botón "Volver al carrito" debajo de "Confirmar pago simulado" y enlace dentro del mensaje de error tras un pago rechazado.

### Cómo se comprobó

1. `node --check` sin errores en `pedidos-mejoras.js`, `pago-mejoras.js` y `pruebas/comprobante-txt.js`.
2. Prueba de consola `pruebas/comprobante-txt.js` en `/pedidos.html` (con al menos un pedido): verifica los datos y avisos del texto, el tipo y el nombre del archivo, y que su contenido coincide. Resultado esperado: `OK: el comprobante (...) incluye todos los datos y avisos.`
3. Revisión manual en `/pago.html`: la ayuda cambia al elegir método o escenario; con "Pago rechazado" aparece el mensaje de error con el enlace "Volver al carrito" y el carrito se conserva.

### Límites

- El comprobante es de demostración; no reemplaza un comprobante de pago real.
- La prueba se ejecuta a mano en la consola del navegador (igual que las del carrito); no forma parte de `mvn verify`.

## Scripts de prueba de consola (Frontend)

- `pruebas/carrito-confirmacion.js`: verifica el vaciado del carrito tras confirmación y la persistencia en `localStorage`.
- `pruebas/carrito-cancelacion.js`: comprueba que cancelar la operación conserve intactos los productos, cantidades y total.
