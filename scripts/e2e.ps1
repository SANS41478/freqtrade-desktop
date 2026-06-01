# ============================================================
# Freqtrade Desktop — 端到端自动化脚本 (PowerShell)
# 运行: powershell -ExecutionPolicy Bypass -File scripts\e2e.ps1
# ============================================================
$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Freqtrade Desktop — E2E Test Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- Config ----
$ConfigPath = Join-Path $RootDir "user_data\config.json"
$DataDir = Join-Path $RootDir "user_data\data\binance"
$Pairs = @("BTC/USDT", "ETH/USDT", "SOL/USDT")
$Timeframe = "5m"
$Timerange = "20260201-20260520"
$Strategy = "SampleStrategy"

# ---- Step 1: Check Python ----
Write-Host "[1/6] Checking Python..." -ForegroundColor Yellow
try {
    $pyVersion = python --version 2>&1
    Write-Host "  $pyVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Python not found. Install Python 3.11+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# ---- Step 2: Check/Install Freqtrade ----
Write-Host "[2/6] Checking Freqtrade..." -ForegroundColor Yellow
$freqtradeInstalled = python -c "import freqtrade; print(freqtrade.__version__)" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installing freqtrade..." -ForegroundColor Yellow
    pip install freqtrade --break-system-packages 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] Could not install freqtrade" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  Freqtrade $freqtradeInstalled" -ForegroundColor Green

# ---- Step 3: Ensure config exists ----
Write-Host "[3/6] Checking config..." -ForegroundColor Yellow
if (-not (Test-Path $ConfigPath)) {
    Write-Host "  [FAIL] Config not found at $ConfigPath" -ForegroundColor Red
    exit 1
}
Write-Host "  Config OK" -ForegroundColor Green

# ---- Step 4: Download data ----
Write-Host "[4/6] Downloading OHLCV data..." -ForegroundColor Yellow
Write-Host "  Pairs: $($Pairs -join ', ')" -ForegroundColor Gray
Write-Host "  Timeframe: $Timeframe" -ForegroundColor Gray
Write-Host "  Range: $Timerange" -ForegroundColor Gray

python -m freqtrade download-data `
    -c $ConfigPath `
    -t $Timeframe `
    --timerange $Timerange `
    --exchange binance `
    -p $($Pairs -join ' ')

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] Data download had issues, continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  Data download complete" -ForegroundColor Green
}

# ---- Step 5: Run backtest ----
Write-Host "[5/6] Running backtest..." -ForegroundColor Yellow
Write-Host "  Strategy: $Strategy" -ForegroundColor Gray
Write-Host "  Timeframe: $Timeframe" -ForegroundColor Gray

python -m freqtrade backtesting `
    -c $ConfigPath `
    -s $Strategy `
    --timeframe $Timeframe `
    --timerange $Timerange `
    --enable-protections

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] Backtest had issues, check output above" -ForegroundColor Yellow
} else {
    Write-Host "  Backtest complete!" -ForegroundColor Green
}

# ---- Step 6: Start webserver ----
Write-Host "[6/6] Starting webserver..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Freqtrade API Server" -ForegroundColor White
Write-Host "  URL:  http://127.0.0.1:8080/api/v1/ping" -ForegroundColor Gray
Write-Host "  WS:   ws://127.0.0.1:8080/api/v1/message/ws" -ForegroundColor Gray
Write-Host "  User: freqtrader / SuperSecurePassword" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open new terminal" -ForegroundColor Gray
Write-Host "  2. cd desktop && npm install && npm run dev" -ForegroundColor Gray
Write-Host "  3. Open http://localhost:5173" -ForegroundColor Gray
Write-Host "  4. Go to 回测中心 → 查看历史回测 → 可视化" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m freqtrade webserver -c $ConfigPath
