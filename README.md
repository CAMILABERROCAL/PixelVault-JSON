# Colegio Cerca · Villa El Salvador

Borrador de documentación de la entrega final de Herramientas de Desarrollo.

Colegio Cerca permite encontrar diez colegios de Villa El Salvador, consultar niveles educativos, dirección y fuentes, y comparar coincidencias según los filtros elegidos. La aplicación completa está en `web/`. El navegador carga el catálogo desde `web/datos/colegios.json`. Nginx sirve las páginas, los scripts, los datos y las fotos desde la misma imagen.

## Sitio público en Render

[Abrir Colegio Cerca](https://colegio-cerca-ves.onrender.com/). Busca un colegio, filtra por gestión y abre su ficha. Para reproducir la publicación como sitio estático, conecta el repositorio en Render, selecciona una rama que contenga el sitio y configura `web` como directorio de publicación desde la raíz. El contenido está listo para servir sin compilación. La dirección pública permite mostrar el sitio desde otro dispositivo.

## Git y GitHub

La rama de presentación es `entrega/colegio-cerca`. Se preparó sobre `feature/camila-colegios-ves`, con los aportes Docker de los PR 30 a 32 y las pruebas de `feature/jhair-actions-colegios`. En GitHub, abre los commits y el historial de los pull requests para mostrar cómo se revisaron e integraron los cambios. El manifiesto de esta entrega es `k8s/colegio-cerca.yaml`.

## GitHub Actions

Los seis workflows con prefijo Jhair verifican sintaxis JavaScript, estructura HTML, catálogo, filtros, fichas y respuesta HTTP. En la pestaña Actions elige la ejecución de la rama de entrega y abre los pasos del trabajo para mostrar el resultado. Con Node.js también se puede repetir la suite desde la raíz.

```powershell
node --test pruebas/colegios.test.cjs pruebas/detalle-colegios.test.cjs pruebas/estructura-html-colegios.test.cjs pruebas/filtros-colegios.test.cjs
```

## Docker

`Dockerfile.web` copia el sitio a Nginx. Para una demostración independiente de Kubernetes, abre Docker Desktop en modo de contenedores Linux y ejecuta desde la carpeta del proyecto:

```powershell
docker build -f Dockerfile.web -t colegio-cerca:ves-v1 .
docker run --rm -p 8082:80 colegio-cerca:ves-v1
```

Abre http://localhost:8082. Ctrl+C detiene esta demostración. [Capturas del equipo](docs/ejecucion-docker-colegios.md).

## Kubernetes en Docker Desktop

Activa Kubernetes en Docker Desktop y espera a que el clúster esté en ejecución. En Windows, haz doble clic en **PRESENTAR.cmd**. El archivo comprueba Docker y el contexto docker-desktop, construye la imagen, aplica el Deployment y el Service en el namespace default, espera al Pod y muestra el estado. El Service dirige tráfico al puerto 80 del contenedor seleccionado por la etiqueta app=colegio-cerca.

Con la ventana abierta, entra a http://localhost:8083. El reenvío de puertos usa el Service. Abre una ficha y cambia un filtro para probar la aplicación desde el clúster. En una segunda ventana de PowerShell comprueba:

```powershell
kubectl --context docker-desktop -n default get pods -l app=colegio-cerca
kubectl --context docker-desktop -n default get service colegio-cerca
(Invoke-RestMethod http://localhost:8083/datos/colegios.json).colegios.Count
```

Para la exposición guarda una captura del Pod con READY 1/1 y STATUS Running, otra del Service y otra del directorio con localhost:8083 visible. El último comando debe devolver 10. Mantén abierta la ventana de PRESENTAR.cmd durante la demostración.

### Diagnóstico

Si el contexto docker-desktop no existe, comprueba que Kubernetes esté habilitado en Docker Desktop. Si el Pod indica ImagePullBackOff, comprueba que Docker usa el motor local de Docker Desktop y que el clúster puede acceder a la imagen construida. En clústeres con almacén aislado, importa la imagen en los nodos o usa una imagen publicada en un registro accesible y actualiza el campo image. Si el puerto 8083 está ocupado, usa otro puerto libre, por ejemplo:

```powershell
kubectl --context docker-desktop -n default port-forward service/colegio-cerca 8084:80
```

Abre http://localhost:8084 en ese caso.
