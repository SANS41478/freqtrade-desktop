import { contextBridge, ipcRenderer } from 'electron'

export interface ConfigFileResult {
  success: boolean
  data?: Record<string, unknown>
  path?: string
  error?: string
}

export interface StrategyFile {
  name: string
  path: string
}

export interface TradeNotification {
  type: 'entry' | 'exit' | 'stop_loss' | 'warning'
  pair: string
  profit?: number
  profitPct?: number
  tradeId?: number
  message?: string
}

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Freqtrade connection ---
  getApiUrl: () => ipcRenderer.invoke('freqtrade:getApiUrl') as Promise<string>,
  getWsUrl: () => ipcRenderer.invoke('freqtrade:getWsUrl') as Promise<string>,
  getPort: () => ipcRenderer.invoke('freqtrade:getPort') as Promise<number>,
  startFreqtrade: () => ipcRenderer.invoke('freqtrade:start'),
  stopFreqtrade: () => ipcRenderer.invoke('freqtrade:stop'),
  isFreqtradeRunning: () => ipcRenderer.invoke('freqtrade:isRunning') as Promise<boolean>,
  onStdout: (callback: (msg: string) => void) => {
    ipcRenderer.on('freqtrade:stdout', (_event, msg) => callback(msg))
  },
  onStderr: (callback: (msg: string) => void) => {
    ipcRenderer.on('freqtrade:stderr', (_event, msg) => callback(msg))
  },
  onClosed: (callback: (code: number) => void) => {
    ipcRenderer.on('freqtrade:closed', (_event, code) => callback(code))
  },

  // --- Window controls (frameless) ---
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:isMaximized') as Promise<boolean>,
  onWindowMaximized: (callback: (maximized: boolean) => void) => {
    ipcRenderer.on('window:maximized', (_event, maximized) => callback(maximized))
  },

  // --- Config file management ---
  configGetPath: () => ipcRenderer.invoke('config:getPath') as Promise<string>,
  configRead: () => ipcRenderer.invoke('config:read') as Promise<ConfigFileResult>,
  configWrite: (config: Record<string, unknown>) =>
    ipcRenderer.invoke('config:write', config) as Promise<ConfigFileResult>,
  configExport: () => ipcRenderer.invoke('config:export') as Promise<ConfigFileResult>,
  configImport: () => ipcRenderer.invoke('config:import') as Promise<ConfigFileResult>,

  // --- Strategy file management ---
  strategyList: () => ipcRenderer.invoke('strategy:list') as Promise<{
    success: boolean; files?: StrategyFile[]; error?: string;
  }>,
  strategyRead: (name: string) => ipcRenderer.invoke('strategy:read', name) as Promise<{
    success: boolean; code?: string; path?: string; error?: string;
  }>,
  strategyWrite: (name: string, code: string) =>
    ipcRenderer.invoke('strategy:write', name, code) as Promise<ConfigFileResult>,
  strategyCreate: (name: string) =>
    ipcRenderer.invoke('strategy:create', name) as Promise<ConfigFileResult>,

  // --- Desktop notifications ---
  notifyTrade: (data: TradeNotification) => ipcRenderer.invoke('notify:trade', data),

  // --- Data file management ---
  dataList: () => ipcRenderer.invoke('data:list') as Promise<{
    success: boolean; files?: { name: string; pair: string; timeframe: string; size: number; ext: string }[]; path?: string; error?: string;
  }>,
  dataDelete: (filename: string) => ipcRenderer.invoke('data:delete', filename) as Promise<{
    success: boolean; error?: string;
  }>,

  // --- Window events ---
  onWindowVisible: (callback: (visible: boolean) => void) => {
    ipcRenderer.on('window:visible', (_event, visible) => callback(visible))
  },
  onNavigate: (callback: (tab: string, id?: number) => void) => {
    ipcRenderer.on('navigate:trade', (_event, id: number) => callback('trades', id))
  },
})
