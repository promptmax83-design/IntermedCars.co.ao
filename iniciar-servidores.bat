@echo off
echo ============================================
echo   IntermedCars - A iniciar todos os servidores
echo ============================================
echo.

:: Abrir PHP Backend
echo [1] A iniciar PHP Backend (porta 8080)...
start "IntermedCars Backend" cmd /k "cd /d C:\Users\Carla Fernanda\Documents\PHP-Project && C:\Users\Carla Fernanda\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe -S localhost:8080 -t public"

:: Esperar 2 segundos
timeout /t 2 /nobreak >nul

:: Abrir Next.js Frontend
echo [2] A iniciar Next.js Frontend (porta 3000)...
start "IntermedCars Frontend" cmd /k "cd /d C:\Users\Carla Fernanda\Documents\New OpenCode Project\site-institucional && npm run dev"

:: Esperar 3 segundos
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   Servidores iniciados!
echo ============================================
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:3000
echo.
echo   Para parar: fecha as janelas do terminal
echo.

:: Abrir browser automaticamente
timeout /t 3 /nobreak >nul
start http://localhost:3000

pause
