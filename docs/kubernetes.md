# Despliegue local de PixelVault-JSON en Kubernetes (Docker Desktop)

**Responsable del avance 3:** Diego.
**Alcance del ZIP revisado:** Spring Boot 3.3.4, Java 17, frontend servido desde `src/main/resources/static`, API y almacenamiento JSON. Este ZIP aún contiene PixelVault, no una versión nueva confirmada de colegios.

## Objetivo

Desplegar la aplicación completa del ZIP en Kubernetes local, comprobar que exista al menos un Pod y un Service y mostrar la web en un navegador. Esta implementación es local: **no equivale a publicar Kubernetes en internet** ni reemplaza el despliegue separado por GitHub Pages.

## Archivos de la carpeta k8s/

| Archivo | Uso |
| --- | --- |
| `deployment.yaml` | Crea un Deployment con 1 réplica y ejecuta el contenedor Spring Boot en el puerto 8081. Incluye health checks y variables tomadas de un Secret. |
| `service.yaml` | Crea un Service interno `ClusterIP` en el puerto 8081. |
| `pvc.yaml` | Pide 1 GiB de almacenamiento persistente para el JSON. |

`JsonStore` utiliza un bloqueo de archivo exclusivo (`tienda.lock`). Por eso el Deployment usa `replicas: 1` y estrategia `Recreate`: **no aumentar réplicas** sin rediseñar el almacenamiento.

## 1. Preparación

Abrir Docker Desktop con contenedores Linux y habilitar Kubernetes desde su vista Kubernetes (o Settings, según la versión). Seleccionar el cluster local de Docker Desktop; con el provisionador `kind`, utilizar el **containerd image store** para compartir la imagen que se construirá localmente.

Abrir la **carpeta raíz** de `PixelVault-JSON-main` en VS Code, luego `Terminal > New Terminal` (PowerShell). Verificar:

```powershell
docker version
kubectl version --client
kubectl config get-contexts
kubectl config use-context docker-desktop
kubectl get nodes
kubectl get storageclass
```

Se espera al menos un nodo `Ready` y una StorageClass predeterminada para aprovisionar el PVC. Si el contexto se llama diferente en tu instalación, selecciona el que corresponda a Docker Desktop.

## 2. Construcción de la imagen

Desde la carpeta que contiene `Dockerfile`, `pom.xml` y `k8s/`:

```powershell
docker build -t pixelvault-k8s:v1 .
docker images pixelvault-k8s
```

El Dockerfile **ejecuta `mvn verify`** al construir. Si las pruebas fallan, la imagen no estará disponible y será necesario resolver el error o coordinarlo con Alexander; no se ha modificado el Dockerfile.

## 3. Configuración de credenciales

Crear un archivo local `.env` a partir del ejemplo y cambiar las credenciales de demostración por otras propias. La contraseña de administrador inicial debe tener **al menos 12 caracteres**. **No subir `.env` ni los Secret exportados al repositorio.**

```powershell
Copy-Item .env.example .env
code .env
```

El archivo `.env` debe contener claves `PIXELVAULT_ADMIN_EMAIL` y `PIXELVAULT_ADMIN_PASSWORD`, sin comillas. Crear o actualizar el Secret **local** sin guardar su contenido en un YAML versionado:

```powershell
kubectl create secret generic pixelvault-admin --from-env-file=.env --dry-run=client -o yaml | kubectl apply -f -
kubectl get secret pixelvault-admin
```

El Secret se utiliza al crear por primera vez `tienda.json`; si ya existe un archivo JSON en el volumen, cambiar estas variables no modificará automáticamente el usuario administrador guardado.

## 4. Aplicar Kubernetes

```powershell
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl rollout status deployment/pixelvault --timeout=300s
kubectl get deployments,pods,services,pvc -l app=pixelvault
```

Esperado: `Deployment` con 1 réplica disponible, `Pod` con estado `Running` y `READY 1/1`, `Service` con puerto 8081 y PVC `Bound`. No afirmar que funciona sin verificar esos resultados.

## 5. Verificar la aplicación desde Windows

En una terminal VS Code, ejecutar y **mantenerla abierta**:

```powershell
kubectl port-forward service/pixelvault-service 8082:8081
```

Abrir una **segunda terminal** y consultar:

```powershell
Invoke-RestMethod http://localhost:8082/actuator/health
Invoke-WebRequest http://localhost:8082/ -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-RestMethod http://localhost:8082/api/videojuegos
```

Resultados esperados: `status: UP`, `StatusCode: 200` y un JSON con el catálogo. Abrir **http://localhost:8082/** para mostrar la web; probar los filtros o algún flujo del proyecto. La prueba de API es pública según `SecurityConfig.java`.

> El Service es de tipo `ClusterIP`, accesible por el túnel `kubectl port-forward`. El puerto **8082** es local y evita conflictos con otro proceso Docker/Spring Boot que utilice **8081**. `port-forward` no publica la web en internet.

## 6. Inspección y evidencias

```powershell
kubectl get nodes
kubectl get pods -l app=pixelvault -o wide
kubectl get deployments,services,pvc -l app=pixelvault
kubectl describe deployment pixelvault
kubectl describe service pixelvault-service
kubectl logs deployment/pixelvault --tail=80
```

Guardar capturas de:

1. Docker Desktop con Kubernetes funcionando.
2. Terminal con el nodo `Ready`.
3. Terminal con Deployment `1/1`, Pod `1/1 Running`, Service creado, PVC `Bound`.
4. Terminal con `port-forward` y comprobación `UP` / HTTP `200`.
5. Navegador con la página cargada en `http://localhost:8082/`.

## 7. Errores frecuentes

- **`kubectl` no se reconoce:** confirmar que Docker Desktop incluya `kubectl` en el PATH o instalar su CLI oficial; reiniciar la terminal.
- **Contexto equivocado:** consultar `kubectl config get-contexts` y volver a Docker Desktop.
- **`ErrImageNeverPull` / no encuentra la imagen:** revisar `docker images pixelvault-k8s` y si se construyó con el mismo almacén containerd que usa Docker Desktop Kubernetes. En el provisionador `kind`, no usar el Docker image store clásico.
- **`CreateContainerConfigError` (Secret):** comprobar `kubectl get secret pixelvault-admin`.
- **PVC `Pending`:** verificar `kubectl get storageclass`; configurar una StorageClass predeterminada antes del despliegue.
- **`CrashLoopBackOff`:** revisar `kubectl logs deployment/pixelvault --previous`; comprobar que la contraseña tenga al menos 12 caracteres y que el volumen `/app/datos` permita escritura. Si la causa es permisos del volumen, revisar el driver y los permisos con el equipo; no resolverlo quitando sin más el usuario no root.
- **Puerto 8082 ocupado:** usar `kubectl port-forward service/pixelvault-service 8083:8081` y visitar `localhost:8083`.
- **Cambio de imagen sin reflejarse en el Pod:** reconstruir con una etiqueta distinta (por ejemplo `pixelvault-k8s:v2`), cambiar `image:` en `deployment.yaml`, aplicar y comprobar el rollout. Reutilizar `v1` con `imagePullPolicy: Never` no obliga al Pod actual a actualizarse.

## 8. Limpieza y precauciones

Detener solo el túnel con `Ctrl+C` en la terminal del `port-forward`. Kubernetes seguirá ejecutando la aplicación.

Para eliminar únicamente el Deployment y Service:

```powershell
kubectl delete -f k8s/deployment.yaml -f k8s/service.yaml
```

El PVC y el Secret permanecen. **No borrar el PVC** si se quieren conservar los JSON; la eliminación del volumen puede ocasionar pérdida de datos según la política del almacenamiento.

## Nota para la exposición

> Utilizamos Kubernetes dentro de Docker Desktop para desplegar la aplicación completa. El Deployment administra un Pod con el contenedor de Spring Boot, el Service permite acceder a él y un volumen persistente conserva los datos JSON. Verificamos el estado del Pod y comprobamos que la aplicación responde por HTTP. La demostración local de Kubernetes es independiente de GitHub Pages.

## Comandos rápidos de verificación
- `kubectl get pods` — Verifica que el pod esté en estado `Running`.
- `kubectl get svc` — Comprueba el puerto expuesto del servicio.
- `kubectl get pvc` — Confirma que el volumen persistente esté en estado `Bound`.