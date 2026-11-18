# Automatización y pruebas del directorio de colegios

Esta documentación explica qué verifican los workflows de GitHub Actions de la página **Colegio Cerca · Villa El Salvador** (carpeta `web/`) y cómo comprobar los filtros y las fichas de detalle a mano.

## Workflows

Todos están en `.github/workflows/` y se ejecutan en la pestaña **Actions** de GitHub. Se activan con cambios en la rama `feature/jhair-actions-colegios` o en un Pull Request hacia `main`, y también manualmente con *Run workflow*.

| Workflow | Qué verifica | Se activa al cambiar |
|---|---|---|
| Jhair - Sintaxis JavaScript colegios | `app.js` y `colegios-core.js` no tienen errores de sintaxis | `web/js/` |
| Jhair - Validar catálogo de colegios | El JSON es válido, los IDs no se repiten, hay 5 privados y 5 públicos, y las fuentes usan HTTPS | `web/datos/` |
| Jhair - Prueba de filtros | Gestión, nivel, presupuesto, orden, búsqueda por texto y resultados vacíos | `colegios-core.js`, datos o la prueba de filtros |
| Jhair - Prueba de ficha de detalle | Campos de cada ficha, importes "Consultar", enlaces pendientes y fuentes | `app.js`, datos o la prueba de detalle |
| Jhair - Prueba de estructura HTML | Los IDs que usa `app.js` existen en `index.html` y el diálogo de detalle está bien definido | `index.html` o `app.js` |
| Jhair - Smoke test del sitio | El sitio y el catálogo responden por HTTP | `web/` |

### Cómo leer el resultado

1. Abre la pestaña **Actions** del repositorio.
2. Busca el workflow por su nombre, que empieza con "Jhair -".
3. Un check verde significa que todo pasó. Uno rojo indica el paso que falló; abre el log de ese paso para ver el mensaje.

## Pruebas automáticas en tu computadora

Desde la raíz del proyecto, con Node.js 24 o superior:

```powershell
node --test pruebas/filtros-colegios.test.cjs
node --test pruebas/detalle-colegios.test.cjs
node --test pruebas/estructura-html-colegios.test.cjs
```

Para correr todas juntas:

```powershell
node --test pruebas/colegios.test.cjs pruebas/filtros-colegios.test.cjs pruebas/detalle-colegios.test.cjs pruebas/estructura-html-colegios.test.cjs
```

Si todo está bien, la salida termina con `pass` igual al número de pruebas y `fail 0`.

## Comprobación manual de filtros

Abre la página con el servidor local (`python -m http.server 5500 --directory web`) y visita `http://localhost:5500`.

1. **Tipo de gestión:** elige *Público*. Todas las tarjetas deben decir PÚBLICO. Repite con *Privado*.
2. **Nivel educativo:** elige *Primaria*. Cada tarjeta debe mostrar la etiqueta Primaria entre sus niveles.
3. **Combinación:** elige *Privado* y *Secundaria*. Solo deben aparecer privados que ofrezcan secundaria.
4. **Pensión:** en *Hasta S/*, escribe `300`. Los privados con pensión mayor a 300 deben desaparecer. Los públicos se mantienen.
5. **Precios por consultar:** desmarca *Incluir precios por consultar* con el presupuesto puesto. Los privados sin importe publicado deben desaparecer.
6. **Búsqueda:** escribe `villa el salvador` o un nombre parcial, sin tildes. Debe encontrar resultados. Escribe `zzzz` y debe aparecer el mensaje "No encontramos coincidencias".
7. **Orden:** prueba *Nombre A–Z*, *Menor pensión publicada* y *Coincidencia con mis filtros*. Con esta última aparece el aviso de que la coincidencia no es una evaluación de calidad.
8. **Restablecer:** usa el botón *Limpiar* o *Limpiar filtros*. El contador debe volver a mostrar los 10 colegios.

En cada cambio, el contador de arriba debe actualizarse con el número de opciones.

## Comprobación manual de la ficha de detalle

1. En cualquier tarjeta, pulsa **Ver información**. Se abre una ventana con el nombre del colegio, la sede y la descripción.
2. Revisa que aparezcan: tipo de gestión, niveles documentados, dirección, turno, pensión mensual, matrícula, cuota de ingreso y año de costos.
3. En un colegio privado sin importe publicado, la pensión debe decir **Consultar**, nunca S/ 0.
4. Si un enlace de Google Maps o Facebook no está cargado, debe aparecer como **pendiente** y no debe ser clicable.
5. En la sección *Fuentes de esta ficha*, cada enlace debe abrir una página externa en una pestaña nueva.
6. Cierra la ventana con la × o con la tecla Escape.

## Qué no cubren las pruebas

- No comprueban que los datos del colegio sean correctos. Las direcciones y costos vienen del catálogo y deben confirmarse con cada colegio.
- No validan imágenes externas, porque dependen de sitios que pueden caducar.
- El smoke test solo confirma que el sitio responde, no que todos los filtros funcionen en un navegador. Eso se comprueba con la lista manual de arriba.