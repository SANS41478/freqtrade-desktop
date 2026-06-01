@echo off
REM 快速环境检查
echo ============================================
echo  Freqtrade Desktop — 环境检查
echo ============================================
echo.

echo [检查] Python 3.11+...
python --version 2>nul
if %errorlevel% neq 0 (
    echo   [缺失] 请安装 Python 3.11+: https://www.python.org/
) else (
    for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do echo   [OK] Python %%v
)

echo.
echo [检查] Node.js...
node --version 2>nul
if %errorlevel% neq 0 (
    echo   [缺失] 请安装 Node.js 18+: https://nodejs.org/
) else (
    for /f %%v in ('node --version 2^>^&1') do echo   [OK] Node %%v
)

echo.
echo [检查] npm...
call npm --version 2>nul
if %errorlevel% neq 0 (
    echo   [缺失] npm 随 Node.js 一起安装
) else (
    for /f %%v in ('npm --version 2^>^&1') do echo   [OK] npm %%v
)

echo.
echo [检查] Freqtrade...
python -c "import freqtrade; print(freqtrade.__version__)" 2>nul
if %errorlevel% neq 0 (
    echo   [待安装] pip install freqtrade --break-system-packages
) else (
    for /f %%v in ('python -c "import freqtrade; print(freqtrade.__version__)" 2^>^&1') do echo   [OK] Freqtrade %%v
)

echo.
echo [检查] 配置文件...
if exist "..\user_data\config.json" (
    echo   [OK] config.json 存在
) else (
    echo   [缺失] config.json 不存在
)

echo.
echo ============================================
echo  检查完毕!
echo ============================================
pause
