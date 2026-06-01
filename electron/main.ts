import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, Notification, nativeImage } from 'electron'
import type { NativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, ChildProcess } from 'child_process'

let mainWindow: BrowserWindow | null = null
let freqtradeProcess: ChildProcess | null = null
let tray: Tray | null = null
let isQuitting = false

const isDev = !app.isPackaged
const FREQTRADE_PORT = 8080

// ============================================================
// Path helpers
// ============================================================

function getPreloadPath() {
  return path.join(__dirname, 'preload.js')
}

function getConfigPath(): string {
  if (isDev) return path.join(__dirname, '..', '..', 'user_data', 'config.json')
  // Production: try userData first, then bundled resource
  const userConfig = path.join(app.getPath('userData'), 'config.json')
  if (fs.existsSync(userConfig)) return userConfig
  return path.join(process.resourcesPath, 'config.json')
}

function getStrategiesDir(): string {
  if (isDev) return path.join(__dirname, '..', '..', 'user_data', 'strategies')
  // Production: try userData first, then bundled resource
  const userDir = path.join(app.getPath('userData'), 'strategies')
  ensureDir(userDir)
  return userDir
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ============================================================
// Tray icon generation (programmatic, no external file needed)
// ============================================================

function createTrayIcon(): NativeImage {
  // Create a 16x16 icon with a simple "F" shape
  const size = 16
  const canvas = Buffer.alloc(size * size * 4)
  const primaryColor = { r: 59, g: 130, b: 246 } // blue-500

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // Rounded rect shape
      const inRect =
        x >= 2 && x < size - 2 && y >= 1 && y < size - 1
      const inCorner =
        (x < 3 || x >= size - 3) && (y < 2 || y >= size - 2)

      if (inRect && !inCorner) {
        canvas[i] = primaryColor.r
        canvas[i + 1] = primaryColor.g
        canvas[i + 2] = primaryColor.b
        canvas[i + 3] = 255
      } else if ((x >= 4 && x <= 6 && y >= 5 && y <= 10) ||  // F vertical bar
                 (x >= 7 && x <= 9 && y >= 5 && y <= 6) ||   // F top bar
                 (x >= 7 && x <= 9 && y >= 8 && y <= 9)) {   // F middle bar
        canvas[i] = 255
        canvas[i + 1] = 255
        canvas[i + 2] = 255
        canvas[i + 3] = 255
      } else {
        canvas[i] = 0
        canvas[i + 1] = 0
        canvas[i + 2] = 0
        canvas[i + 3] = 0
      }
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

// ============================================================
// System Tray
// ============================================================

function createTray() {
  const icon = createTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Freqtrade Desktop')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      },
    },
    { type: 'separator' },
    {
      label: '交易状态: Dry-Run',
      enabled: false,
    },
    {
      label: 'Freqtrade: 未启动',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '启动 Freqtrade',
      click: () => startFreqtrade(),
    },
    {
      label: '停止 Freqtrade',
      click: () => stopFreqtrade(),
    },
    { type: 'separator' },
    {
      label: '退出 Freqtrade Desktop',
      click: () => {
        isQuitting = true
        stopFreqtrade()
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // Double-click tray icon to show window
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

function updateTrayMenu(status: string, freqtradeRunning: boolean) {
  if (!tray) return
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      },
    },
    { type: 'separator' },
    {
      label: `交易状态: ${status}`,
      enabled: false,
    },
    {
      label: `Freqtrade: ${freqtradeRunning ? '运行中' : '未启动'}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '启动 Freqtrade',
      enabled: !freqtradeRunning,
      click: () => startFreqtrade(),
    },
    {
      label: '停止 Freqtrade',
      enabled: freqtradeRunning,
      click: () => stopFreqtrade(),
    },
    { type: 'separator' },
    {
      label: '退出 Freqtrade Desktop',
      click: () => {
        isQuitting = true
        stopFreqtrade()
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}

// ============================================================
// Desktop Notifications
// ============================================================

function sendNotification(title: string, body: string, tradeId?: number) {
  if (!Notification.isSupported()) return

  const notification = new Notification({
    title,
    body,
    icon: createTrayIcon(),
    urgency: 'critical',
    timeoutType: 'default',
  })

  notification.on('click', () => {
    mainWindow?.show()
    mainWindow?.focus()
    if (tradeId !== undefined) {
      mainWindow?.webContents.send('navigate:trade', tradeId)
    }
  })

  notification.show()
}

// IPC: receive notification requests from renderer
ipcMain.handle('notify:trade', (_event, data: {
  type: 'entry' | 'exit' | 'stop_loss' | 'warning'
  pair: string
  profit?: number
  profitPct?: number
  tradeId?: number
  message?: string
}) => {
  switch (data.type) {
    case 'entry': {
      const dir = data.message?.includes('short') ? '做空' : '做多'
      sendNotification(
        `🚀 ${dir}入场: ${data.pair}`,
        `策略已开仓 ${data.pair}`,
        data.tradeId,
      )
      break
    }
    case 'exit': {
      const emoji = (data.profit ?? 0) >= 0 ? '✅' : '🔴'
      const pct = data.profitPct !== undefined
        ? `${data.profitPct >= 0 ? '+' : ''}${(data.profitPct * 100).toFixed(2)}%`
        : ''
      sendNotification(
        `${emoji} 平仓: ${data.pair}`,
        `盈亏: ${pct}${data.profit !== undefined ? ` ($${data.profit.toFixed(2)})` : ''}`,
        data.tradeId,
      )
      break
    }
    case 'stop_loss':
      sendNotification(
        `🛑 止损触发: ${data.pair}`,
        `止损价已触发，仓位已平仓`,
        data.tradeId,
      )
      break
    case 'warning':
      sendNotification(
        `⚠️ ${data.pair}`,
        data.message ?? '警告',
        data.tradeId,
      )
      break
  }
})

// ============================================================
// Window Management
// ============================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Freqtrade Desktop',
    backgroundColor: '#0d1117',
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Track maximize state for custom title bar
  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximized', false))

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Notify renderer when window is shown/hidden
  mainWindow.on('show', () => {
    mainWindow?.webContents.send('window:visible', true)
  })
  mainWindow.on('hide', () => {
    mainWindow?.webContents.send('window:visible', false)
  })
}

// ============================================================
// IPC: Window controls (frameless window)
// ============================================================

ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

// ============================================================
// Freqtrade Process Management
// ============================================================

function startFreqtrade() {
  if (freqtradeProcess) return

  // In both dev and production (without bundled Python), use system python
  const pythonPath = 'python'

  // Config path: user can customize via environment or use default
  const configPath = process.env.FREQTRADE_CONFIG || getConfigPath()

  // Working dir is userData — all freqtrade data (downloads, backtests) stored here
  const userDataDir = app.getPath('userData')
  ensureDir(path.join(userDataDir, 'user_data', 'data'))
  ensureDir(path.join(userDataDir, 'user_data', 'strategies'))
  ensureDir(path.join(userDataDir, 'user_data', 'backtest_results'))

  freqtradeProcess = spawn(pythonPath, [
    '-m', 'freqtrade', 'webserver',
    '-c', configPath,
    '--user-data', path.join(userDataDir, 'user_data'),
    '--port', String(FREQTRADE_PORT),
    '--loglevel', 'info',
  ], {
    cwd: userDataDir,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  })

  freqtradeProcess.stdout?.on('data', (data: Buffer) => {
    const msg = data.toString()
    mainWindow?.webContents.send('freqtrade:stdout', msg)
  })

  freqtradeProcess.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString()
    mainWindow?.webContents.send('freqtrade:stderr', msg)
  })

  freqtradeProcess.on('close', (code) => {
    mainWindow?.webContents.send('freqtrade:closed', code)
    freqtradeProcess = null
    updateTrayMenu('Dry-Run', false)
  })

  updateTrayMenu('Dry-Run', true)
  sendNotification('Freqtrade', 'Freqtrade 已启动 (webserver 模式)')
}

function stopFreqtrade() {
  if (freqtradeProcess) {
    freqtradeProcess.kill('SIGTERM')
    freqtradeProcess = null
    updateTrayMenu('Dry-Run', false)
  }
}

// ============================================================
// IPC: Freqtrade connection
// ============================================================

ipcMain.handle('freqtrade:getPort', () => FREQTRADE_PORT)
ipcMain.handle('freqtrade:getApiUrl', () => `http://127.0.0.1:${FREQTRADE_PORT}/api/v1`)
ipcMain.handle('freqtrade:getWsUrl', () => `ws://127.0.0.1:${FREQTRADE_PORT}/api/v1/message/ws`)
ipcMain.handle('freqtrade:start', () => { startFreqtrade() })
ipcMain.handle('freqtrade:stop', () => { stopFreqtrade() })
ipcMain.handle('freqtrade:isRunning', () => freqtradeProcess !== null)

// ============================================================
// IPC: Config file management
// ============================================================

ipcMain.handle('config:getPath', () => getConfigPath())

ipcMain.handle('config:read', async () => {
  const configPath = getConfigPath()
  try {
    if (!fs.existsSync(configPath)) {
      return { success: false, error: '配置文件不存在', path: configPath }
    }
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return { success: true, data: parsed, path: configPath }
  } catch (e) {
    return { success: false, error: `读取失败: ${(e as Error).message}`, path: configPath }
  }
})

ipcMain.handle('config:write', async (_event, config: Record<string, unknown>) => {
  const configPath = getConfigPath()
  try {
    ensureDir(path.dirname(configPath))
    const json = JSON.stringify(config, null, 2)
    fs.writeFileSync(configPath, json, 'utf-8')
    return { success: true, path: configPath }
  } catch (e) {
    return { success: false, error: `写入失败: ${(e as Error).message}` }
  }
})

ipcMain.handle('config:export', async () => {
  const configPath = getConfigPath()
  if (!fs.existsSync(configPath)) return { success: false, error: '配置文件不存在' }
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: '导出配置文件',
    defaultPath: 'config.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })
  if (result.canceled || !result.filePath) return { success: false, error: '已取消' }
  fs.copyFileSync(configPath, result.filePath)
  return { success: true, path: result.filePath }
})

ipcMain.handle('config:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '导入配置文件',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) return { success: false, error: '已取消' }
  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8')
    JSON.parse(raw)
    const configPath = getConfigPath()
    ensureDir(path.dirname(configPath))
    fs.copyFileSync(result.filePaths[0], configPath)
    return { success: true, path: configPath }
  } catch (e) {
    return { success: false, error: `导入失败: ${(e as Error).message}` }
  }
})

// ============================================================
// IPC: Strategy file management
// ============================================================

ipcMain.handle('strategy:list', async () => {
  const dir = getStrategiesDir()
  try {
    if (!fs.existsSync(dir)) return { success: true, files: [] }
    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.py'))
      .map((f) => ({ name: f.replace('.py', ''), path: path.join(dir, f) }))
    return { success: true, files }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('strategy:read', async (_event, name: string) => {
  const filePath = path.join(getStrategiesDir(), `${name}.py`)
  try {
    if (!fs.existsSync(filePath)) return { success: false, error: '文件不存在' }
    const code = fs.readFileSync(filePath, 'utf-8')
    return { success: true, code, path: filePath }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('strategy:write', async (_event, name: string, code: string) => {
  const filePath = path.join(getStrategiesDir(), `${name}.py`)
  try {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, code, 'utf-8')
    return { success: true, path: filePath }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('strategy:create', async (_event, name: string) => {
  const filePath = path.join(getStrategiesDir(), `${name}.py`)
  if (fs.existsSync(filePath)) return { success: false, error: `策略 "${name}" 已存在` }
  const template = `# ${name} strategy
from freqtrade.strategy import IStrategy
import talib.abstract as ta
import pandas as pd

class ${name}(IStrategy):
    INTERFACE_VERSION = 3
    timeframe = '5m'
    can_short = False
    minimal_roi = {"0": 0.01, "60": 0.02, "1440": 0.05}
    stoploss = -0.10
    trailing_stop = True

    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['ema_short'] = ta.EMA(dataframe, timeperiod=12)
        dataframe['ema_long'] = ta.EMA(dataframe, timeperiod=26)
        return dataframe

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[
            (dataframe['rsi'] < 30) & (dataframe['ema_short'] > dataframe['ema_long']),
            'enter_long'
        ] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[dataframe['rsi'] > 70, 'exit_long'] = 1
        return dataframe
`
  try {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, template, 'utf-8')
    return { success: true, path: filePath }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

// ============================================================
// IPC: Data file management
// ============================================================

function getDataDir(): string {
  if (isDev) return path.join(__dirname, '..', '..', 'user_data', 'data', 'binance')
  return path.join(app.getPath('userData'), 'user_data', 'data', 'binance')
}

ipcMain.handle('data:list', async () => {
  const dir = getDataDir()
  try {
    if (!fs.existsSync(dir)) return { success: true, files: [] }
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => {
        const stat = fs.statSync(path.join(dir, e.name))
        const parts = e.name.replace(/\.(json|feather|parquet)$/, '').split('-')
        return {
          name: e.name,
          pair: parts[0]?.replace(/_/g, '/') ?? 'unknown',
          timeframe: parts[1] ?? 'unknown',
          size: stat.size,
          ext: path.extname(e.name).slice(1),
        }
      })
      .sort((a, b) => b.size - a.size)
    return { success: true, files, path: dir }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('data:delete', async (_event, filename: string) => {
  const filePath = path.join(getDataDir(), filename)
  try {
    if (!fs.existsSync(filePath)) return { success: false, error: '文件不存在' }
    fs.unlinkSync(filePath)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
})

// ============================================================
// App Lifecycle
// ============================================================

// Register custom app:// protocol for production (file:// has CORS/crossorigin issues)
app.whenReady().then(() => {
  // Remove default menu bar
  Menu.setApplicationMenu(null)

  createWindow()
  createTray()
  startFreqtrade()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

app.on('window-all-closed', () => {
  // Don't quit on window close — stay in tray
  // On macOS, this is standard behavior
  if (process.platform !== 'darwin') {
    // Stay alive with tray
  }
})

app.on('before-quit', () => {
  isQuitting = true
  stopFreqtrade()
})

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
