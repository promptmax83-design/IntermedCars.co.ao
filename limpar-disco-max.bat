@echo off
echo ============================================
echo   IntermedCars - Limpeza Maxima de Disco
echo ============================================
echo.
echo A limpar TUDO que e seguro apagar...
echo.

echo [1/15] A limpar temp do Windows...
del /q /f /s "%TEMP%\*" 2>nul
rd /s /q "%TEMP%" 2>nul
mkdir "%TEMP%" 2>nul
del /q /f /s "C:\Windows\Temp\*" 2>nul
echo       OK.

echo [2/15] A limpar cache do Chrome...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" 2>nul
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Service Worker\CacheStorage" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Service Worker\CacheStorage" 2>nul
)
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\GPUCache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\GPUCache" 2>nul
)
echo       OK.

echo [3/15] A limpar cache do Edge...
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" 2>nul
)
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache" (
    rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache" 2>nul
)
echo       OK.

echo [4/15] A limpar cache do Windows Update...
net stop wuauserv 2>nul
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul
net start wuauserv 2>nul
echo       OK.

echo [5/15] A limpar cache do Windows Defender...
del /q /f /s "C:\ProgramData\Microsoft\Windows Defender\Scans\History\*" 2>nul
del /q /f /s "C:\ProgramData\Microsoft\Windows Defender\Scans\Results\*" 2>nul
echo       OK.

echo [6/15] A limpar thumbnails...
del /q /f /s "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo       OK.

echo [7/15] A limpar cache DNS...
ipconfig /flushdns 2>nul
echo       OK.

echo [8/15] A limpar logs do Windows...
del /q /f /s "C:\Windows\Logs\CBS\*.log" 2>nul
del /q /f /s "C:\Windows\Logs\DISM\*.log" 2>nul
del /q /f /s "C:\Windows\Logs\MoSetup\*.log" 2>nul
del /q /f /s "C:\Windows\Panther\*.log" 2>nul
echo       OK.

echo [9/15] A limpar cache de ícones...
del /q /f /s "%LOCALAPPDATA%\IconCache.db" 2>nul
echo       OK.

echo [10/15] A limpar prefetch...
del /q /f /s "C:\Windows\Prefetch\*" 2>nul
echo       OK.

echo [11/15] A limpar cache do npm...
if exist "%APPDATA%\npm-cache" (
    rd /s /q "%APPDATA%\npm-cache" 2>nul
)
echo       OK.

echo [12/15] A limpar cache do Composer...
if exist "%APPDATA%\Composer\cache" (
    rd /s /q "%APPDATA%\Composer\cache" 2>nul
)
echo       OK.

echo [13/15] A limpar dumps de crash...
del /q /f /s "C:\Windows\Minidump\*" 2>nul
del /q /f /s "%LOCALAPPDATA%\CrashDumps\*" 2>nul
echo       OK.

echo [14/15] A limpar ficheiros de diagnostico...
del /q /f /s "C:\ProgramData\Microsoft\Diagnosis\ETLLogs\*" 2>nul
del /q /f /s "C:\ProgramData\Microsoft\Diagnosis\Logs\*" 2>nul
echo       OK.

echo [15/15] A esvaziar a Reciclagem...
rd /s /q "%SystemDrive%\$Recycle.Bin" 2>nul
echo       OK.

echo.
echo ============================================
echo   Limpeza maxima concluida!
echo ============================================
echo.
echo Reinicia o computador para melhores resultados.
echo.
pause
