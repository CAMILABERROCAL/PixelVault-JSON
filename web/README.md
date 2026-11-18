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
- Filtros independientes por gestión y nivel.
- Tarjetas y detalle accesible con teclado (Escape cierra la ventana).
- Contacto telefónico, mapa por dirección y enlaces de fuentes.
- Orden alfabético y por coincidencia con preferencias.
- Diseño adaptable a teléfono y escritorio.

## Ranking propuesto
El orden por coincidencia asigna un punto a cada criterio seleccionado y satisfecho: gestión y nivel. Muestra aciertos/total, no estrellas ni calidad educativa. Los valores desconocidos no suman. La búsqueda textual siempre se respeta; en modo coincidencia se incluyen alternativas que pueden no cumplir todos los criterios. Sin criterios, se ordena por nombre. Esta metodología es una propuesta para acordar con el equipo/docente.

## Catálogo y edición manual
`datos/colegios.json` contiene exactamente 10 colegios seleccionados por Camila: 5 privados (Pamer, Saco Oliveros, Trilce, Innova Laderas, María Auxiliadora) y 5 públicos (6066, 7091, 6048, 6063, 6065). Se retiraron IE 557 e Innova Vallejo. No hay filtro de zonas ni categoría nidos. Inicial puede aparecer únicamente como información del colegio en sus niveles.

### Añadir imágenes, Facebook y Maps desde VS Code
Busca el nombre del colegio en `web/datos/colegios.json`. Completa los campos vacíos, conservando las comillas y comas:

```json
"imagenUrl": "",
"facebookUrl": "",
"googleMapsUrl": ""
```

- `imagenUrl`: pegar una URL HTTPS directa que sirva una imagen (no un enlace de búsqueda de Google ni una página de Facebook). También admite una imagen guardada en `web/img/`, por ejemplo `./img/pamer.png`. Las imágenes externas pueden caducar o bloquear su carga; guardar el archivo local suele ser más estable.
- `facebookUrl`: URL HTTPS de la página oficial del colegio.
- `googleMapsUrl`: enlace HTTPS de la ubicación exacta copiado desde Compartir en Google Maps. Se admiten enlaces cortos `https://maps.app.goo.gl/...`.
- En Pamer el logo se sirve desde `web/img/pamer-ves.png`. La dirección abre Google Maps con las coordenadas facilitadas y el teléfono se muestra en su propio recuadro.
- Si la imagen falta o falla, se conserva un cuadrado vacío. No aparecen iniciales ni un escudo inventado.
- Si falta un enlace, se muestra como pendiente y no es clicable. No se genera una búsqueda de Maps que pueda apuntar a otro colegio.
- Una misma imagen aparece en la tarjeta y en la ventana de detalle.
- Tras guardar, recarga el navegador. Para actualizar la web online, incorpora el cambio al flujo Git y publica desde main.

### Datos pendientes de confirmación
Las direcciones aportadas por el equipo se mantienen. En Saco Oliveros, María Auxiliadora y República del Perú hay referencias pendientes de contrastar o diferencias entre fuentes: `notaUbicacion` las explica en el detalle. `referenciaEquipo` conserva el enlace de búsqueda proporcionado por Camila; no equivale a un enlace exacto de Maps ni a una fuente ya verificada. `fuentes` recoge páginas consultadas, oficiales cuando estuvieron disponibles y directorios secundarios identificados en los demás casos.

El directorio no publica ni filtra por costos. Las familias pueden consultarlos directamente con el colegio. Los niveles de Innova Laderas permanecen pendientes de confirmación específica de sede. La fecha del catálogo es la de edición, no una garantía de vigencia de todos los datos.

## Pruebas
Desde la raíz:
```powershell
node --test pruebas/colegios.test.cjs
node --check web/js/app.js
```


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
