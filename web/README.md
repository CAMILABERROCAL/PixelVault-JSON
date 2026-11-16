# Colegio Cerca · Villa El Salvador

Parte de Camila para el tercer avance de Herramientas de Desarrollo. Aplicación pública estática, sin login, backend Java ni base de datos. El nombre es provisional. Esta versión vive en `web/` y no cambia todavía el proyecto AulaLibro de `src/`.

## Ejecutar en Windows
Desde la raíz del repositorio:

```powershell
python -m http.server 5500 --directory web
```

Abrir http://localhost:5500. No abrir index.html por doble clic: la lectura del JSON requiere HTTP. Detener con Ctrl+C. Docker y Maven no son necesarios para esta versión.

## Funciones
- Búsqueda tolerante a tildes por nombre, sede y dirección.
- Filtros independientes por gestión, nivel, zona y rango de pensión.
- Tarjetas y detalle accesible con teclado (Escape cierra la ventana).
- Contacto telefónico, mapa por dirección y enlaces de fuentes.
- Orden alfabético, por pensión publicada y coincidencia con preferencias.
- Diseño adaptable a teléfono y escritorio.

## Ranking propuesto
El orden por coincidencia asigna un punto a cada criterio seleccionado y satisfecho: gestión, nivel, zona y presupuesto. Muestra aciertos/total, no estrellas ni calidad educativa. Los valores desconocidos no suman. La búsqueda textual siempre se respeta; en modo coincidencia se incluyen alternativas que pueden no cumplir todos los criterios. Sin criterios, se ordena por nombre. Los públicos se consideran compatibles con el presupuesto de pensión, independientemente del mínimo introducido. Esta metodología es una propuesta para acordar con el equipo/docente.

## Catálogo y pendientes de contenido
`datos/colegios.json` contiene seis fichas iniciales de fuentes oficiales consultadas el 16/11/2026. No es un listado exhaustivo. Verificar cada sede/nivel antes de ampliar la información.
- No se encontraron tarifarios verificados en las páginas consultadas: importes `null` se muestran como Consultar, nunca como cero.
- En Laderas de Villa los niveles quedan vacíos hasta confirmación específica de sede.
- Los logos oficiales están pendientes. Se usa un emblema genérico identificado como referencial, no un escudo inventado. Para añadir uno, guardar el archivo en `web/img/` y establecer `logo` como `./img/nombre.png` (SVG, PNG, WEBP o JPG).
- No hay opiniones, calificaciones ni precios inventados. Las fuentes están en cada ficha.
- Para añadir precios, indicar importes numéricos, año de referencia y enlace del tarifario en fuentes; revisar el año antes de cada entrega.

## Pruebas
Desde la raíz:
```powershell
node --test pruebas/colegios.test.cjs
node --check web/js/app.js
```
Las pruebas usan importes sintéticos solo en memoria para comprobar límites; no se publican como datos de colegios.

## Publicación en GitHub Pages
1. Integrar la carpeta `web/`, las pruebas y `.github/workflows/publicar-colegios.yml` en `main` después de revisarlas.
2. En Settings > Pages, seleccionar GitHub Actions como fuente de publicación.
3. Ejecutar `Camila - Publicar directorio de colegios` desde Actions en `main` (o un push que modifique web/).
4. Usar la URL devuelta por el trabajo Publicar web. El workflow solo publica desde main.

Las rutas relativas funcionan bajo el subdirectorio del repositorio en Pages. No necesita secretos ni un dominio de pago. No publicar el .env ni archivos locales con usuarios del proyecto anterior.

## Contrato para Alexander y Diego
- Raíz pública del sitio: `web/` (copiar su contenido a la raíz pública de Nginx).
- Imagen acordada: `colegios-ves:avance3`.
- Puerto HTTP del contenedor Nginx: 80; puerto del host propuesto para Compose: 8081.
- No necesita variables de administrador, volúmenes de datos ni el JAR anterior.
- Diego debe hacer que la imagen esté disponible en el clúster local y configurar correctamente imagePullPolicy según el método elegido.
- Prueba mínima: `/` y `/datos/colegios.json` responden; búsqueda, filtros y detalles funcionan desde la URL del Service.
- Alexander modifica Docker; Diego agrega k8s/. Esta entrega no cambia sus archivos.
