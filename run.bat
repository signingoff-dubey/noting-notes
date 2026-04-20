@echo off
setlocal enabledelayedexpansion
title INK — Starting up...

echo.
echo  ============================================
echo    INK — Think local. Think deep.
echo  ============================================
echo.

:: ── [1/6] Check Python ──────────────────────────
echo  [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Python not found.
    echo  Install Python 3.11+ from https://python.org and re-run.
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo         Python %PYVER% found.
echo.

:: ── [2/6] Install backend dependencies ──────────
echo  [2/6] Installing backend dependencies...
pip install -r backend\requirements.txt -q
if %errorlevel% neq 0 (
    echo  WARNING: Some dependencies may have failed — continuing anyway.
)
echo         Dependencies ready.
echo.

:: ── [3/6] Check Ollama ──────────────────────────
echo  [3/6] Checking Ollama installation...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  NOTE: Ollama not found. AI features will be unavailable.
    echo  Install from https://ollama.com if you want local AI.
    echo.
    set OLLAMA_AVAILABLE=0
) else (
    for /f "tokens=*" %%v in ('ollama --version 2^>^&1') do set OLLAVER=%%v
    echo         Ollama found: !OLLAVER!
    set OLLAMA_AVAILABLE=1
)
echo.

:: ── [4/6] Pull AI models ────────────────────────
if "!OLLAMA_AVAILABLE!"=="1" (
    echo  [4/6] Checking AI models ^(first run may take 5-10 min^)...
    ollama list 2>nul | findstr "mistral" >nul
    if errorlevel 1 (
        echo         Pulling mistral:7b-instruct-q4_K_M ...
        ollama pull mistral:7b-instruct-q4_K_M
    ) else (
        echo         mistral model already present.
    )
    ollama list 2>nul | findstr "nomic-embed-text" >nul
    if errorlevel 1 (
        echo         Pulling nomic-embed-text ...
        ollama pull nomic-embed-text
    ) else (
        echo         nomic-embed-text already present.
    )
) else (
    echo  [4/6] Skipping model check ^(Ollama not installed^).
)
echo.

:: ── [5/6] Start backend ─────────────────────────
echo  [5/6] Starting backend server on http://localhost:8000 ...
start /B "" python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

:: Wait until backend is ready (poll health endpoint)
set RETRIES=0
:WAIT_BACKEND
timeout /t 1 /nobreak >nul
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    set /a RETRIES+=1
    if !RETRIES! lss 20 goto WAIT_BACKEND
    echo  WARNING: Backend didn't respond after 20s — it may still be starting.
) else (
    echo         Backend ready.
)
echo.

:: ── [6/6] Start frontend ────────────────────────
echo  [6/6] Installing frontend dependencies and launching...
pushd frontend
call npm install --silent
if !errorlevel! neq 0 (
    echo  WARNING: npm install had errors — attempting to run anyway.
) else (
    echo         Frontend dependencies ready.
)
echo.
echo  ============================================
echo    INK is running at http://localhost:3000
echo    Backend API:      http://localhost:8000
echo    Press Ctrl+C to stop.
echo  ============================================
echo.
call npm run dev -- --open
popd

endlocal
