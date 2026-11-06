@echo off
setlocal
cd /d "%~dp0"
echo Starting RECO AI GitHub Pages edition...
where node >nul 2>nul || (echo Node.js is required. Install Node.js 22+ first. & pause & exit /b 1)
if not exist node_modules (echo Installing packages... & npm install)
if errorlevel 1 (echo Package installation failed. & pause & exit /b 1)
npm run dev
