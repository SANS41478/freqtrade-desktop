# Freqtrade Desktop — 环境检查 (PowerShell)
$ErrorActionPreference = "Continue"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Freqtrade Desktop — 环境检查" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Python
Write-Host "[检查] Python 3.11+..." -NoNewline
try {
    $v = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>&1
    $major = [int]($v -split '\.')[0]
    $minor = [int]($v -split '\.')[1]
    if ($major -ge 3 -and $minor -ge 11) {
        Write-Host " OK (Python $v)" -ForegroundColor Green
    } else {
        Write-Host " FAIL (需要 3.11+)" -ForegroundColor Red
    }
} catch {
    Write-Host " 未安装" -ForegroundColor Red
    Write-Host "  安装: https://www.python.org/" -ForegroundColor Gray
}

# Node.js
Write-Host "[检查] Node.js..." -NoNewline
try {
    $nv = node --version 2>&1
    Write-Host " OK ($nv)" -ForegroundColor Green
} catch {
    Write-Host " 未安装" -ForegroundColor Red
}

# npm
Write-Host "[检查] npm..." -NoNewline
try {
    $npmv = npm --version 2>&1
    Write-Host " OK (v$npmv)" -ForegroundColor Green
} catch {
    Write-Host " 未安装" -ForegroundColor Red
}

# Freqtrade
Write-Host "[检查] Freqtrade..." -NoNewline
try {
    $fv = python -c "import freqtrade; print(freqtrade.__version__)" 2>&1
    Write-Host " OK ($fv)" -ForegroundColor Green
} catch {
    Write-Host " 未安装" -ForegroundColor Yellow
    Write-Host "  运行: pip install freqtrade --break-system-packages" -ForegroundColor Gray
}

# Config
Write-Host "[检查] config.json..." -NoNewline
$configPath = Join-Path $PSScriptRoot "..\..\user_data\config.json"
if (Test-Path $configPath) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " 缺失" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 检查完毕!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
