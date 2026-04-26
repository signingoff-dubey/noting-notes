@echo off
title INK — Starting...

echo INK - Starting...

cd /d "%~dp0"

:: Create data dirs
if not exist "data" mkdir data
if not exist "data\attachments" mkdir data\attachments

:: Start backend (no venv)
start "INK Backend" cmd /c "python -m uvicorn backend.main:app --port 8000"

:: Wait for backend
:wait
timeout /t 2 >nul 2>&1
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 goto wait

:: Start frontend
start "INK Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo === INK ready at http://localhost:3000 ===
echo Press any key to exit (servers keep running)
pause >nul