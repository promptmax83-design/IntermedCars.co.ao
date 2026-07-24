@echo off
set PATH=C:\node\node-v22.16.0-win-x64;%%PATH%%
cd /d "%~dp0frontend"
"C:\node\node-v22.16.0-win-x64\npm.cmd" run dev
