@echo off
REM ============================================================
REM 快速下载回测数据 + 运行回测 (一步完成)
REM 用法: download-and-backtest.bat
REM ============================================================
cd /d "%~dp0..\.."

echo 下载历史数据...
python -m freqtrade download-data ^
    -c user_data\config.json ^
    -t 5m 15m 1h ^
    --timerange 20260201-20260520 ^
    --exchange binance ^
    -p BTC/USDT ETH/USDT SOL/USDT DOGE/USDT BNB/USDT

echo.
echo ============================================
echo 数据下载完成!
echo ============================================
echo.
echo 运行回测...

python -m freqtrade backtesting ^
    -c user_data\config.json ^
    -s SampleStrategy ^
    --timeframe 5m ^
    --timerange 20260301-20260520 ^
    --enable-protections

echo.
echo ============================================
echo 回测完成! 查看完整可视化:
echo   1. 启动 webserver: python -m freqtrade webserver -c user_data\config.json
echo   2. 启动桌面 UI:  cd desktop ^&^& npm run dev
echo   3. 打开 http://localhost:5173 → 回测中心 → 查看历史回测
echo ============================================

pause
