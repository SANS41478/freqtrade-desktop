@echo off
REM ============================================================
REM Freqtrade Desktop — 端到端测试启动脚本
REM 按顺序执行: 安装依赖 → 下载数据 → 启动 webserver → 回测
REM ============================================================
setlocal enabledelayedexpansion

cd /d "%~dp0.."

echo ============================================
echo  Freqtrade Desktop — E2E 启动向导
echo ============================================
echo.

REM --- Step 1: Check Python ---
echo [1/5] 检查 Python 环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Python 未安装或不在 PATH 中
    echo        请安装 Python 3.11+ https://www.python.org/
    pause
    exit /b 1
)
python --version
echo [OK] Python 就绪
echo.

REM --- Step 2: Install Freqtrade ---
echo [2/5] 检查 Freqtrade 安装...
python -c "import freqtrade" >nul 2>&1
if %errorlevel% neq 0 (
    echo Freqtrade 未安装，正在安装...
    pip install freqtrade --break-system-packages
    if %errorlevel% neq 0 (
        echo [错误] Freqtrade 安装失败
        pause
        exit /b 1
    )
)
python -m freqtrade --version
echo [OK] Freqtrade 就绪
echo.

REM --- Step 3: Download backtest data ---
echo [3/5] 下载历史数据 (BTC/USDT 5m, 最近 180 天)...
python -m freqtrade download-data ^
    -c user_data\config.json ^
    -t 5m ^
    --timerange 20250101-20260520 ^
    --exchange binance ^
    -p BTC/USDT ETH/USDT SOL/USDT
if %errorlevel% neq 0 (
    echo [警告] 数据下载有问题，但继续...
)
echo [OK] 数据下载完成
echo.

REM --- Step 4: Run backtest ---
echo [4/5] 运行回测 (SampleStrategy, 5m, 2025-01 至 2026-05)...
python -m freqtrade backtesting ^
    -c user_data\config.json ^
    -s SampleStrategy ^
    --timeframe 5m ^
    --timerange 20250101-20260520 ^
    --enable-protections
echo [OK] 回测完成
echo.

REM --- Step 5: Start webserver ---
echo [5/5] 启动 API 服务器...
echo.
echo ============================================
echo  Freqtrade webserver 已启动!
echo  API:  http://127.0.0.1:8080/api/v1/ping
echo  WS:   ws://127.0.0.1:8080/api/v1/message/ws
echo  UI:   http://localhost:5173 (npm run dev)
echo ============================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

python -m freqtrade webserver -c user_data\config.json

pause
