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

interface ApiConnectionConfig {
  apiUrl: string
  wsUrl: string
  host: string
  port: number
  username: string
  password: string
  wsToken: string
}

interface HyperoptStartPayload {
  strategy: string
  epochs: number
  spaces: string
  loss?: string | null
  timerange?: string | null
  timeframe?: string | null
  jobs?: number
  randomized_search?: boolean
  enable_protections?: boolean
}

interface HyperoptResultFile {
  filename: string
  strategy: string
  best_loss: number | null
  epochs: number | null
  hyperopt_start_time: number | null
  notes: string | null
}

interface Window {
  electronAPI?: {
    // Freqtrade connection
    getApiConfig: () => Promise<ApiConnectionConfig>
    getApiUrl: () => Promise<string>
    getWsUrl: () => Promise<string>
    getPort: () => Promise<number>
    startFreqtrade: () => Promise<void>
    stopFreqtrade: () => Promise<void>
    isFreqtradeRunning: () => Promise<boolean>
    onStdout: (callback: (msg: string) => void) => void
    onStderr: (callback: (msg: string) => void) => void
    onClosed: (callback: (code: number) => void) => void

    // Hyperopt (CLI-driven)
    hyperoptStart: (payload: HyperoptStartPayload) => Promise<{ success: boolean; error?: string }>
    hyperoptStop: () => Promise<{ success: boolean; error?: string }>
    hyperoptIsRunning: () => Promise<boolean>
    hyperoptList: () => Promise<{ success: boolean; files?: HyperoptResultFile[]; error?: string }>
    hyperoptDelete: (filename: string) => Promise<{ success: boolean; error?: string }>
    onHyperoptStdout: (callback: (msg: string) => void) => void
    onHyperoptStderr: (callback: (msg: string) => void) => void
    onHyperoptClosed: (callback: (code: number | null) => void) => void

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
