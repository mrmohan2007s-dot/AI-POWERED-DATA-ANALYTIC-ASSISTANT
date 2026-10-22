Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  InsightAI — AI-Powered Data Analytics Assistant" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "[1/3] Setting up Python virtual environment..." -ForegroundColor Yellow
    py -m venv venv
    Write-Host "[2/3] Installing backend packages..." -ForegroundColor Yellow
    .\venv\Scripts\pip.exe install -r backend\requirements.txt
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend packages..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "Starting InsightAI Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\python.exe backend\run.py"

Start-Sleep -Seconds 2

Write-Host "Starting InsightAI Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "InsightAI is running!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
