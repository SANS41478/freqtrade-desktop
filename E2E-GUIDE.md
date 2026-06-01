# Freqtrade Desktop — 端到端启动指南

## 前置条件

- Python 3.11+
- Node.js 18+
- Git (可选)

## 一次性环境准备

```powershell
# 1. 进入 Freqtrade 目录
cd F:\freqtrade\freqtrade

# 2. 安装 Freqtrade (如果未安装)
pip install freqtrade --break-system-packages

# 3. 安装策略依赖
pip install TA-Lib technical pyarrow --break-system-packages

# 4. 验证安装
python -m freqtrade --version
# 应输出: 2026.5-dev-xxxxx
```

## 网络说明 (中国用户)

config.json 已配置使用 Binance 测试网 (testnet.binance.vision) 获取交易对信息，国内可直接访问。
历史数据使用本地 JSON 文件，无需实时联网。

## 端到端运行 (一键)

```powershell
# 在项目根目录 F:\freqtrade\freqtrade 执行:
powershell -ExecutionPolicy Bypass -File desktop\scripts\e2e.ps1
```

此脚本会自动完成:
1. 检查 Python 环境
2. 安装 Freqtrade (如需要)
3. 下载 BTC/USDT, ETH/USDT, SOL/USDT 的 5m OHLCV 数据
4. 运行 SampleStrategy 回测
5. 启动 webserver 在 http://127.0.0.1:8080

## 启动桌面 UI

```powershell
# 新开一个终端
cd F:\freqtrade\freqtrade\desktop
npm install
npm run dev
```

打开 http://localhost:5173，即可看到:
- **仪表盘** — 连接 webserver 后显示真实权益和持仓
- **回测中心** — 运行回测 → 5 个 Tab 完整可视化 (权益曲线/交易对/月度/分析/明细)
- **策略管理** — 查看/编辑 SampleStrategy 源码
- **配置编辑器** — 可视化编辑 config.json

## API 验证 (确认 webserver 正常)

```powershell
# webserver 启动后，另开终端:
python desktop\scripts\verify-api.py
```

会依次检查 15+ 个 API 端点，输出每个端点的状态。

## 手动运行回测

```powershell
cd F:\freqtrade\freqtrade

# 注意: Binance 5m 数据仅保留约 90 天，timerange 需与实际数据匹配
python -m freqtrade backtesting \
    -c user_data/config.json \
    -s SampleStrategy \
    --timeframe 5m \
    --timerange 20260301-20260520
```

## 常见问题

**Q: `pip install freqtrade` 权限不足?**
A: 加 `--user` 或 `--break-system-packages` 参数

**Q: 数据下载很慢?**
A: 正常。BTC/USDT 5m 数据 1 年约有 10 万根 K 线。先用少量交易对测试

**Q: webserver 启动后 `localhost:5173` 连不上?**
A: 确认 CORS 已配置。config.json 中 `api_server.CORS_origins` 包含 `http://localhost:5173`

**Q: 回测结果为空 / "No history found"?**
A: Binance 5m 数据仅保留约 90 天。确保 timerange 与本地数据日期匹配。
   检查: `python -c "import json; d=json.load(open('user_data/data/binance/BTC_USDT-5m.json')); from datetime import datetime; print(datetime.fromtimestamp(d[0][0]/1000), '→', datetime.fromtimestamp(d[-1][0]/1000))"`

**Q: 回测时交易所连接超时?**
A: 国内用户需确保 config.json 中 exchange.ccxt_config.urls 指向 testnet.binance.vision。
   已默认配置，不要删除此设置。
