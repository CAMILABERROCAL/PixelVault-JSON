@echo off
setlocal
cd /d "%~dp0"
docker info >nul || goto :error
kubectl --context docker-desktop get nodes || goto :error
docker build -f Dockerfile.web -t colegio-cerca:ves-v1 . || goto :error
kubectl --context docker-desktop -n default apply -f k8s/colegio-cerca.yaml || goto :error
kubectl --context docker-desktop -n default rollout status deployment/colegio-cerca --timeout=120s || goto :diagnostico
kubectl --context docker-desktop -n default get pods -l app=colegio-cerca
kubectl --context docker-desktop -n default get service colegio-cerca
echo Abre http://localhost:8083 en el navegador. Deja esta ventana abierta.
kubectl --context docker-desktop -n default port-forward service/colegio-cerca 8083:80
exit /b %errorlevel%
:diagnostico
kubectl --context docker-desktop -n default describe pods -l app=colegio-cerca
:error
echo Revisa el mensaje anterior y la seccion de diagnostico del README.
pause
exit /b 1
