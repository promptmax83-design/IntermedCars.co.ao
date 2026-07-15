@echo off
echo ============================================
echo   IntermedCars - Servidor PHP Backend
echo ============================================
echo.
echo A iniciar servidor em http://localhost:8080
echo Prima Ctrl+C para parar.
echo.

cd /d "C:\Users\Carla Fernanda\Documents\PHP-Project"
"C:\Users\Carla Fernanda\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8080 -t public

pause
