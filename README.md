# Colegio Cerca · Villa El Salvador

Directorio de diez colegios de Villa El Salvador. Las familias pueden buscar una sede por nombre, filtrar por gestión pública o privada y nivel educativo, y abrir su ficha para consultar la dirección en Google Maps, el teléfono disponible y las fuentes de información.

**[Abrir Colegio Cerca en Render](https://colegio-cerca-ves.onrender.com/)**

## Código y documentación

El proyecto se desarrolló en el curso Herramientas de Desarrollo a partir del repositorio de AulaLibro. La versión de Colegio Cerca utilizada en la exposición está en la rama [`entrega/colegio-cerca`](https://github.com/CAMILABERROCAL/PixelVault-JSON/tree/entrega/colegio-cerca).

| Componente | Implementación |
|---|---|
| Sitio web | HTML, CSS y JavaScript. Las fichas se cargan desde un catálogo JSON y las imágenes se incluyen en la carpeta [`web/`](https://github.com/CAMILABERROCAL/PixelVault-JSON/tree/entrega/colegio-cerca/web). |
| Git y GitHub Actions | El equipo trabajó por ramas y verificó el catálogo, los filtros, las fichas, la estructura HTML, la sintaxis JavaScript y la respuesta HTTP del sitio. |
| Publicación en Render | Render sirve el directorio como sitio estático desde la carpeta `web/`. |
| Docker y Kubernetes | `Dockerfile.web` empaqueta el directorio con Nginx. En Docker Desktop, el [manifiesto de Kubernetes](https://github.com/CAMILABERROCAL/PixelVault-JSON/blob/entrega/colegio-cerca/k8s/colegio-cerca.yaml) define un Deployment de una réplica y un Service en el puerto 80. |

Para repetir la demostración en Windows, abre la rama de entrega y sigue los pasos de la [guía de ejecución y pruebas](https://github.com/CAMILABERROCAL/PixelVault-JSON/blob/entrega/colegio-cerca/README.md). Con Docker Desktop y Kubernetes activos, `PRESENTAR.cmd` despliega el sitio y permite consultarlo en `http://localhost:8083`.
