@echo off
TITLE InsightAI — AI-Powered Data Analytics Assistant
COLOR 0B

echo ========================================================
echo   InsightAI — AI-Powered Data Analytics Assistant
echo ========================================================
echo.

IF NOT EXIST "venv\Scripts\python.exe" (
    echo [1/3] Creating Python virtual environment...
    py -m venv venv
    echo [2/3] Installing backend dependencies...
    .\venv\Scripts\pip.exe install -r backend\requirements.txt
)

IF NOT EXIST "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo Starting InsightAI Backend Server (FastAPI on http://127.0.0.1:8000)...
start "InsightAI Backend" cmd /k ".\venv\Scripts\python.exe backend\run.py"

timeout /t 2 >nul

echo Starting InsightAI Frontend Server (Vite on http://localhost:5173)...
start "InsightAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   InsightAI services launched!
echo   - Web App UI:       http://localhost:5173
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
