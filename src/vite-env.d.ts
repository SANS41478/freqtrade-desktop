/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ConfigFileResult {
  success: boolean
  data?: Record<string, unknown>
  path?: string
  error?: string
}

interface StrategyFile {
  name: string
  path: string
}

interface TradeNotification {
  type: 'entry' | 'exit' | 'stop_loss' | 'warning'
  pair: string
  profit?: number
  profitPct?: number
  tradeId?: number
  message?: string
}

interface Window {
  electronAPI?: {
    // Freqtrade connection
    getApiUrl: () => Promise<string>
    getWsUrl: () => Promise<string>
    getPort: () => Promise<number>
    startFreqtrade: () => Promise<void>
    stopFreqtrade: () => Promise<void>
    isFreqtradeRunning: () => Promise<boolean>
    onStdout: (callback: (msg: string) => void) => void
    onStderr: (callback: (msg: string) => void) => void
    onClosed: (callback: (code: number) => void) => void

    // Config
    configGetPath: () => Promise<string>
    configRead: () => Promise<ConfigFileResult>
    configWrite: (config: Record<string, unknown>) => Promise<ConfigFileResult>
    configExport: () => Promise<ConfigFileResult>
    configImport: () => Promise<ConfigFileResult>

    // Strategy
    strategyList: () => Promise<{ success: boolean; files?: StrategyFile[]; error?: string }>
    strategyRead: (name: string) => Promise<{ success: boolean; code?: string; path?: string; error?: string }>
    strategyWrite: (name: string, code: string) => Promise<ConfigFileResult>
    strategyCreate: (name: string) => Promise<ConfigFileResult>

    // Notifications
    notifyTrade: (data: TradeNotification) => Promise<void>

    // Window events
    onWindowVisible: (callback: (visible: boolean) => void) => void
    onNavigate: (callback: (tab: string, id?: number) => void) => void
    // Data file management
    dataList: () => Promise<{
      success: boolean
      files?: { name: string; pair: string; timeframe: string; size: number; ext: string }[]
      path?: string
      error?: string
    }>
    dataDelete: (filename: string) => Promise<{ success: boolean; error?: string }>

    // Window controls (frameless)
    windowMinimize: () => Promise<void>
    windowMaximize: () => Promise<void>
    windowClose: () => Promise<void>
    windowIsMaximized: () => Promise<boolean>
    onWindowMaximized: (callback: (maximized: boolean) => void) => void
  }
}

interface Window {
  electronAPI?: {
    // Freqtrade connection
    getApiUrl: () => Promise<string>
    getWsUrl: () => Promise<string>
    getPort: () => Promise<number>
    startFreqtrade: () => Promise<void>
    stopFreqtrade: () => Promise<void>
    isFreqtradeRunning: () => Promise<boolean>
    onStdout: (callback: (msg: string) => void) => void
    onStderr: (callback: (msg: string) => void) => void
    onClosed: (callback: (code: number) => void) => void

    // Config
    configGetPath: () => Promise<string>
    configRead: () => Promise<ConfigFileResult>
    configWrite: (config: Record<string, unknown>) => Promise<ConfigFileResult>
    configExport: () => Promise<ConfigFileResult>
    configImport: () => Promise<ConfigFileResult>

    // Strategy
    strategyList: () => Promise<{ success: boolean; files?: StrategyFile[]; error?: string }>
    strategyRead: (name: string) => Promise<{ success: boolean; code?: string; path?: string; error?: string }>
    strategyWrite: (name: string, code: string) => Promise<ConfigFileResult>
    strategyCreate: (name: string) => Promise<ConfigFileResult>

    // Notifications
    notifyTrade: (data: TradeNotification) => Promise<void>

    // Window events
    onWindowVisible: (callback: (visible: boolean) => void) => void
    onNavigate: (callback: (tab: string, id?: number) => void) => void
    // Data file management
    dataList: () => Promise<{
      success: boolean
      files?: { name: string; pair: string; timeframe: string; size: number; ext: string }[]
      path?: string
      error?: string
    }>
    dataDelete: (filename: string) => Promise<{ success: boolean; error?: string }>

    // Window controls (frameless)
    windowMinimize: () => Promise<void>
    windowMaximize: () => Promise<void>
    windowClose: () => Promise<void>
    windowIsMaximized: () => Promise<boolean>
    onWindowMaximized: (callback: (maximized: boolean) => void) => void
  }
}
