@echo off
:: Pregunta el mensaje para el commit
set /p commit_message="Introduce el mensaje para el commit: "

:: Agregar todos los cambios al repositorio
git add .

:: Hacer el commit con el mensaje proporcionado
git commit -m "%commit_message%"

:: Subir los cambios a GitHub (repositorio remoto)
git push origin main

:: Mostrar mensaje de éxito
echo Cambios subidos exitosamente a GitHub.
pause
