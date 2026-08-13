# Freqtrade Desktop

> A visual desktop trading console for [Freqtrade](https://github.com/freqtrade/freqtrade), built with Electron + React + TypeScript.

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-31-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
[![Docs](https://img.shields.io/badge/Documentation-online-brightgreen?style=for-the-badge&logo=gitbook&logoColor=white)](https://sans41478.github.io/freqtrade-desktop/)
[![Freqtrade](https://img.shields.io/badge/Powered%20by-Freqtrade-orange?style=for-the-badge)](https://github.com/freqtrade/freqtrade)

---

## Online Documentation

> **Full documentation is available at: [https://sans41478.github.io/freqtrade-desktop/](https://sans41478.github.io/freqtrade-desktop/)**

<table>
<tr>
<td width="50%">

### Getting Started
- **[Quick Start](https://sans41478.github.io/freqtrade-desktop/pages/quickstart.html)** - Get up and running in 5 minutes
- **[Installation Guide](https://sans41478.github.io/freqtrade-desktop/pages/installation.html)** - Detailed setup for Windows / macOS / Linux
- **[Architecture Overview](https://sans41478.github.io/freqtrade-desktop/pages/architecture.html)** - Technical design and data flow

</td>
<td width="50%">

### Feature Guides
- **[Trading Dashboard](https://sans41478.github.io/freqtrade-desktop/pages/dashboard.html)** - Real-time monitoring
- **[Backtest Center](https://sans41478.github.io/freqtrade-desktop/pages/backtest.html)** - Strategy backtesting
- **[Strategy Editor](https://sans41478.github.io/freqtrade-desktop/pages/strategy.html)** - Built-in Monaco editor

</td>
</tr>
<tr>
<td>

### Reference
- **[API Reference](https://sans41478.github.io/freqtrade-desktop/pages/api-reference.html)** - REST API endpoints
- **[WebSocket Protocol](https://sans41478.github.io/freqtrade-desktop/pages/websocket.html)** - Real-time messaging
- **[Keyboard Shortcuts](https://sans41478.github.io/freqtrade-desktop/pages/keyboard-shortcuts.html)** - Shortcuts cheat sheet

</td>
<td>

### Development
- **[Developer Guide](https://sans41478.github.io/freqtrade-desktop/pages/developer-guide.html)** - Contributing & coding conventions
- **[Deployment Guide](https://sans41478.github.io/freqtrade-desktop/pages/deployment.html)** - Build & distribute
- **[Troubleshooting](https://sans41478.github.io/freqtrade-desktop/pages/troubleshooting.html)** - Common issues

</td>
</tr>
</table>

---

## Features

### Real-time Trading Dashboard
![Dashboard](https://placehold.co/1200x600/0d1117/f97316?text=Freqtrade+Desktop+Dashboard)

- **Live Monitoring** - Real-time balance, profit, open positions via WebSocket
- **Equity Curve** - Daily/weekly/monthly profit charts with interactive visualization
- **Quick Actions** - Force entry/exit directly from the dashboard
- **Price Ticker** - Live prices for whitelisted trading pairs

### Trade Management
- **Complete History** - Browse all past trades with pagination
- **Multi-dimensional Filtering** - Filter by pair, direction (long/short), result (win/loss), text search
- **CSV Export** - One-click export for Excel analysis
- **Trade Details** - Click any trade for full timeline, orders, and custom data

### Backtest Center
- **Visual Results** - Equity curves, per-pair stats, monthly breakdowns
- **Multi-strategy Comparison** - Compare up to 5 strategies side-by-side
- **History Management** - Save, review, and delete past backtest runs
- **Configurable Parameters** - Strategy, timeframe, timerange, stake amount, cache settings

### Hyperparameter Optimization
- **Optuna-powered** - Bayesian optimization for strategy parameters
- **Multiple Loss Functions** - Sharpe, Sortino, Calmar, Max DrawDown, and more
- **Real-time Progress** - Track optimization progress with current best loss
- **Optimization Spaces** - buy, sell, roi, stoploss, trailing (configurable)

### Built-in Strategy Editor
- **Monaco Editor** - The same editor powering VS Code
- **Python Syntax Highlighting** - Optimized for Freqtrade strategies
- **Autocomplete** - Strategy interface method suggestions
- **Template System** - Create strategies from built-in templates
- **One-click Save** - Ctrl+S saves directly to user_data/strategies/

### Configuration Editor
- **Visual Forms** - Transform complex JSON config into intuitive forms
- **6 Config Sections** - Trading, Exchange, API Server, Telegram, Pairlists, Orders
- **Validation** - JSON Schema validation with error highlighting
- **Import/Export** - Backup and restore configurations

### K-Line Charts
- **TradingView Lightweight Charts** - Professional-grade candlestick charts
- **Multi-timeframe** - 1m, 5m, 15m, 1h, 4h, 1d
- **Signal Overlay** - Buy/sell signals displayed on candles

### Additional Features
- **Data Download** - Download and manage historical OHLCV data
- **Log Viewer** - Dual-source (API + stdout), level filtering, search, auto-scroll
- **System Tray** - Minimize to tray, start/stop Freqtrade from tray menu
- **Desktop Notifications** - Native OS notifications for trade events
- **Dark Theme** - GitHub-style dark UI with orange accent
- **Responsive Design** - Adapts to different screen sizes

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop Shell | Electron | 31.x |
| UI Framework | React | 18.x |
| Language | TypeScript | 5.5.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| State Management | TanStack Query | 5.x |
| Code Editor | Monaco Editor | 4.6.x |
| Financial Charts | Lightweight Charts | 5.2.x |
| Statistical Charts | Recharts | 2.12.x |
| Backend | Freqtrade (Python) | Latest |

---

## Prerequisites

Before installing Freqtrade Desktop, ensure you have:

- **[Python 3.11+](https://www.python.org/downloads/)** with pip
- **[Node.js 18+](https://nodejs.org/)** with npm
- **[TA-Lib](https://ta-lib.github.io/ta-lib-python/)** C library (required by Freqtrade)
- **[Freqtrade](https://www.freqtrade.io/en/stable/installation/)** installed and working
- At least one supported exchange account ([Binance](https://www.binance.com/), [OKX](https://okx.com/), [Bybit](https://bybit.com/), etc.)

---

## Quick Start

### 1. Start Freqtrade API Server

`ash
# In trading mode (or dry-run)
freqtrade trade --config user_data/config.json --strategy YourStrategy

# Or run the API server standalone (webserver mode)
freqtrade webserver --config user_data/config.json
`

The API server runs on http://127.0.0.1:8080 by default.

### 2. Install & Start Desktop App

`ash
git clone https://github.com/SANS41478/freqtrade-desktop.git
cd freqtrade-desktop/desktop
npm install

# Option A: Browser preview
npm run dev

# Option B: Electron desktop window (with hot reload)
npm run electron:dev
`

### 3. Build for Distribution

`ash
npm run electron:build
`

| Platform | Output |
|----------|--------|
| Windows | elease/Freqtrade Desktop Setup.exe |
| macOS | elease/Freqtrade Desktop.dmg |
| Linux | elease/Freqtrade Desktop.AppImage |

---

## Supported Exchanges

Freqtrade Desktop supports all exchanges compatible with [CCXT](https://github.com/ccxt/ccxt):

| Type | Exchanges |
|------|-----------|
| **Spot** | Binance, BingX, Bitget, Bitmart, Bybit, Gate.io, HTX, Hyperliquid, Kraken, OKX |
| **Futures** | Binance, Bitget, Gate.io, Hyperliquid, OKX, Bybit, Kraken |
| **Community** | Bitvavo, Kucoin |

---

## Project Structure

`
freqtrade-desktop/
├── desktop/
│   ├── electron/              # Electron main process
│   │   ├── main.ts            # Window management, IPC, process control
│   │   └── preload.ts         # Secure bridge (contextBridge)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── charts/        # CandleChart, EquityChart, BacktestResults
│   │   │   ├── editor/        # Monaco-based strategy editor
│   │   │   ├── layout/        # Sidebar, TitleBar, ErrorBoundary
│   │   │   └── trading/       # ForceEntryForm, ForceExitButton
│   │   ├── hooks/             # React hooks (WebSocket, notifications)
│   │   ├── lib/               # API client, WebSocket manager, utils
│   │   ├── pages/             # Page components (11 pages)
│   │   ├── types/             # TypeScript types (550+ lines)
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Entry point
│   ├── docs/                  # Documentation site (GitHub Pages)
│   ├── public/                # Static assets
│   └── package.json
├── config_examples/           # Example configuration files
├── docker/                    # Docker configurations
└── README.md
`

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+1 ~ Ctrl+9 | Switch tabs |
| Ctrl+L | Open log viewer |
| Ctrl+K | Focus search (in docs) |
| F11 | Toggle fullscreen |

---

## Configuration

The app connects to Freqtrade's REST API and WebSocket:

| Setting | Default |
|---------|---------|
| API URL | http://127.0.0.1:8080/api/v1 |
| WebSocket | ws://127.0.0.1:8080/api/v1/message/ws |
| Auth | Basic Auth (configurable in config.json) |

> **Security Note:** Change the default API credentials (pi_server.username / pi_server.password) before running in production. See the [Deployment Guide](https://sans41478.github.io/freqtrade-desktop/pages/deployment.html) for details.

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 10 / macOS 12 / Ubuntu 20.04 | Latest version |
| Python | 3.11 | 3.12+ |
| Node.js | 18.0 | 20 LTS |
| RAM | 2 GB | 4 GB+ |
| Disk | 1 GB | 5 GB+ |
| CPU | 2 vCPU | 4 vCPU+ |

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

1. Fork the repository
2. Create a feature branch: git checkout -b feature/my-feature
3. Ensure 
pm run lint passes
4. Commit with conventional format: eat:, ix:, docs:, etc.
5. Push and create a Pull Request

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

Built on top of [Freqtrade](https://github.com/freqtrade/freqtrade) (also GPL-3.0).

---

## Acknowledgments

- [Freqtrade](https://github.com/freqtrade/freqtrade) - The open-source crypto trading bot that powers the backend
- [Lightweight Charts](https://github.com/nickmura/lightweight-charts) - TradingView's financial charting library
- [Monaco Editor](https://github.com/microsoft/monaco-editor) - The editor that powers VS Code
- [Recharts](https://github.com/Recharts/recharts) - Composable React charting library
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization for React
- [Electron](https://www.electronjs.com/) - Build cross-platform desktop apps