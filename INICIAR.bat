@echo off
cd /d "%~dp0"
where java >nul 2>&1
if errorlevel 1 (echo Instala Java 17 o superior y vuelve a intentarlo. & pause & exit /b 1)
where mvn >nul 2>&1
if errorlevel 1 (echo Instala Maven 3.9 o superior y vuelve a intentarlo. & pause & exit /b 1)
call mvn spring-boot:run
pause
