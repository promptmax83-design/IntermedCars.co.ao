@echo off
echo ========================================
echo   IntermedCars - Todos os Servidores
echo ========================================
echo.
echo A iniciar Backend (PHP)...
start "IntermedCars Backend" cmd /k "cd /d "C:\Users\Carla Fernanda\Documents\New OpenCode Project\PHP-Project" && "C:\Users\Carla Fernanda\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8080 -t public"
timeout /t 2 /nobreak >nul

echo A iniciar Frontend (Next.js)...
start "IntermedCards Frontend" cmd /k "cd /d "C:\Users\Carla Fernanda\Documents\New OpenCode Project\site-institucional" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Servidores Iniciados!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Prima qualquer tecla para fechar...
pause >nul
