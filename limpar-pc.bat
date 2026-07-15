@echo off
echo ============================================
echo   IntermedCars - Limpeza do Computador
echo ============================================
echo.
echo Vou limpar ficheiros temporarios e caches.
echo NAO vou apagar documentos, videos, musicas ou programas.
echo.

echo [1/6] A limpar temp do Windows...
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul
echo       Concluido.

echo [2/6] A limpar cache do Chrome...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    del /q /f /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" 2>nul
    echo       Concluido.
) else (
    echo       Chrome nao encontrado ou cache ja limpo.
)

echo [3/6] A limpar cache do Edge...
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    del /q /f /s "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul
    echo       Concluido.
) else (
    echo       Edge nao encontrado ou cache ja limpo.
)

echo [4/6] A limpar cache do npm...
if exist "%APPDATA%\npm-cache" (
    npm cache clean --force 2>nul
    echo       Concluido.
) else (
    echo       Cache npm nao encontrado.
)

echo [5/6] A limpar ficheiros temporais do sistema...
del /q /f /s "C:\Windows\Prefetch\*" 2>nul
echo       Concluido.

echo [6/6] A esvaziar a Reciclagem...
rd /s /q "%SystemDrive%\$Recycle.Bin" 2>nul
echo       Concluido.

echo.
echo ============================================
echo   Limpeza concluida!
echo ============================================
echo.
pause
