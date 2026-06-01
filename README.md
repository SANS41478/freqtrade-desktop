# Freqtrade Desktop

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-31-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)

A visual desktop trading console for [Freqtrade](https://github.com/freqtrade/freqtrade), built with Electron + React + TypeScript.

![Freqtrade Desktop](https://placehold.co/1200x600/0d1117/f97316?text=Freqtrade+Desktop)

## Features

- **Real-time Dashboard** - Monitor balance, profit, open positions, and live trade activity via WebSocket
- **Trade Management** - View trade history, force entry/exit, manage blacklists and locks
- **K-Line Charts** - Interactive candlestick charts powered by [Lightweight Charts](https://github.com/nickmura/lightweight-charts)
- **Strategy Editor** - Built-in Monaco editor with Freqtrade-specific autocomplete, syntax highlighting, and one-click save
- **Backtest Center** - Run and compare backtests with visual equity curves, per-pair stats, and monthly breakdowns
- **Hyperparameter Optimization** - Configure and run hyperopt jobs with real-time progress tracking
- **Config Editor** - Edit `config.json` with structured form UI and validation
- **Data Download** - Download and manage historical OHLCV data
- **Log Viewer** - Real-time log streaming with level filtering and search
- **Desktop Notifications** - Native OS notifications for trade events
- **System Tray** - Minimize to tray, start/stop Freqtrade from the tray menu

## Prerequisites

- **Freqtrade** installed and accessible ([installation guide](https://www.freqtrade.io/en/stable/installation/))
- **Node.js** 18+ and npm
- **Python** 3.10+ with Freqtrade dependencies
- **TA-Lib** C library (required by Freqtrade)

## Quick Start

### 1. Start Freqtrade API Server

```bash
# Start Freqtrade in trading mode (or dry-run)
freqtrade trade --config user_data/config.json --strategy YourStrategy

# Or run the API server standalone
freqtrade api-server --config user_data/config.json
```

The API server runs on `http://127.0.0.1:8080` by default.

### 2. Start Desktop App (Development)

```bash
git clone https://github.com/YOUR_USERNAME/freqtrade-desktop.git
cd freqtrade-desktop
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to access the UI.

### 3. Build Desktop App (Electron)

```bash
npm run electron:dev    # Development with hot reload
npm run electron:build  # Build distributable package
```

Built packages are output to the `release/` directory.

## Architecture

```
freqtrade-desktop/
├── electron/           # Electron main process
│   ├── main.ts         # Window management, IPC, Freqtrade process control
│   └── preload.ts      # Secure bridge between main and renderer
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── charts/     # CandleChart, EquityChart, BacktestResults, PriceTicker
│   │   ├── editor/     # Monaco-based strategy editor
│   │   ├── layout/     # Sidebar, TitleBar, ErrorBoundary, ConnectionStatus
│   │   └── trading/    # ForceEntryForm, ForceExitButton
│   ├── hooks/          # React hooks (WebSocket, trade notifications, theme)
│   ├── lib/            # API client, WebSocket, utilities
│   ├── pages/          # Page-level components (Dashboard, Trades, Backtest, etc.)
│   ├── types/          # TypeScript type definitions matching Freqtrade API schemas
│   ├── App.tsx         # Root component with routing
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── scripts/            # Environment check and test scripts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 31 |
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State Management | TanStack Query |
| Charts | Recharts, Lightweight Charts |
| Code Editor | Monaco Editor |
| Build Tool | Vite |

## Configuration

The app connects to Freqtrade's REST API. Default connection:

| Setting | Default |
|---------|---------|
| API URL | `http://127.0.0.1:8080` |
| WebSocket | `ws://127.0.0.1:8080/api/v1/message/ws` |
| Auth | Basic (see your Freqtrade config) |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+9` | Switch tabs |
| `Ctrl+L` | Open log viewer |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

This project is built on top of [Freqtrade](https://github.com/freqtrade/freqtrade), which is also licensed under GPL-3.0.

## Acknowledgments

- [Freqtrade](https://github.com/freqtrade/freqtrade) - The open-source crypto trading bot that powers the backend
- [Lightweight Charts](https://github.com/nickmura/lightweight-charts) - Financial charting library
- [Monaco Editor](https://github.com/microsoft/monaco-editor) - The editor that powers VS Code
- [Recharts](https://github.com/recharts/recharts) - Composable charting library