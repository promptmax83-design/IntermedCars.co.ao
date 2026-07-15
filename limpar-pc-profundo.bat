@echo off
echo ============================================
echo   IntermedCars - Limpeza Profunda
echo ============================================
echo.
echo Esta limpeza e mais agressiva mas segura.
echo NAO apaga documentos, videos, musicas ou programas.
echo.

echo [1/10] A limpar temp do Windows...
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul
echo       OK.

echo [2/10] A limpar cache do Chrome...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    del /q /f /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\*" 2>nul
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" (
    del /q /f /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache\*" 2>nul
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Service Worker\CacheStorage" (
    del /q /f /s "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Service Worker\CacheStorage\*" 2>nul
)
echo       OK.

echo [3/10] A limpar cache do Edge...
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    del /q /f /s "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache\*" 2>nul
)
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache" (
    del /q /f /s "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache\*" 2>nul
)
echo       OK.

echo [4/10] A limpar cache do Windows Update...
net stop wuauserv 2>nul
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul
net start wuauserv 2>nul
echo       OK.

echo [5/10] A limpar cache do Windows Defender...
del /q /f /s "C:\ProgramData\Microsoft\Windows Defender\Scans\History\*" 2>nul
echo       OK.

echo [6/10] A limpar thumbnails (icones em cache)...
del /q /f /s "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo       OK.

echo [7/10] A limpar cache DNS...
ipconfig /flushdns 2>nul
echo       OK.

echo [8/10] A limpar ficheiros de diagnostico do Windows...
del /q /f /s "C:\ProgramData\Microsoft\Diagnosis\*" 2>nul
echo       OK.

echo [9/10] A limpar logs antigos do Windows...
del /q /f /s "C:\Windows\Logs\CBS\*.log" 2>nul
del /q /f /s "C:\Windows\Logs\DISM\*.log" 2>nul
echo       OK.

echo [10/10] A esvaziar a Reciclagem...
rd /s /q "%SystemDrive%\$Recycle.Bin" 2>nul
echo       OK.

echo.
echo ============================================
echo   Limpeza profunda concluida!
echo ============================================
echo.
echo Reinicia o computador para melhores resultados.
echo.
pause
