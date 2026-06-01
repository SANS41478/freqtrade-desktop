/**
 * Config service — abstracts over Electron IPC (desktop) and REST API (browser dev).
 * In Electron: reads/writes config.json directly via IPC
 * In browser: falls back to Freqtrade REST API for read-only access
 */

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export interface ConfigData {
  [key: string]: unknown
  trading_mode?: string
  margin_mode?: string
  stake_currency?: string
  stake_amount?: string | number
  max_open_trades?: number
  dry_run?: boolean
  exchange?: {
    name: string
    key: string
    secret: string
    password?: string
  }
  api_server?: {
    enabled: boolean
    listen_ip_address: string
    listen_port: number
    username: string
    password: string
    jwt_secret_key?: string
    ws_token?: string
  }
  telegram?: {
    enabled: boolean
    token: string
    chat_id: string
  }
  pairlists?: {
    method: string
    number_assets: number
    sort_key?: string
  }[]
  order_types?: Record<string, string>
  stoploss?: number
  trailing_stop?: boolean
  minimal_roi?: Record<string, number>
}

export const configService = {
  async read(): Promise<ConfigData | null> {
    if (isElectron) {
      const result = await window.electronAPI!.configRead()
      if (result.success && result.data) return result.data as ConfigData
      console.error('Config read failed:', result.error)
      return null
    }
    // Browser fallback: use REST API
    try {
      const res = await fetch('http://127.0.0.1:8080/api/v1/show_config', {
        headers: {
          Authorization: 'Basic ' + btoa('freqtrader:SuperSecurePassword'),
        },
      })
      if (res.ok) return await res.json()
    } catch {
      // API not available — return null
    }
    return null
  },

  async write(config: ConfigData): Promise<boolean> {
    if (isElectron) {
      const result = await window.electronAPI!.configWrite(config as Record<string, unknown>)
      return result.success
    }
    // Browser mode: can't write, just log
    console.warn('Config write not available in browser dev mode. Run in Electron to save.')
    console.log('Config would be:', JSON.stringify(config, null, 2))
    return false
  },

  async getPath(): Promise<string> {
    if (isElectron) {
      return window.electronAPI!.configGetPath()
    }
    return '~/freqtrade/user_data/config.json'
  },

  async export(): Promise<string | null> {
    if (isElectron) {
      const result = await window.electronAPI!.configExport()
      return result.success ? (result.path ?? null) : null
    }
    return null
  },

  async import(): Promise<string | null> {
    if (isElectron) {
      const result = await window.electronAPI!.configImport()
      return result.success ? (result.path ?? null) : null
    }
    return null
  },

  validate(config: ConfigData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required top-level fields
    if (!config.exchange || !(config.exchange as Record<string, unknown>).name) {
      errors.push('缺少 exchange.name (交易所名称)')
    }
    if (!config.stake_currency) {
      errors.push('缺少 stake_currency (基础货币)')
    }
    if (!config.stake_amount) {
      errors.push('缺少 stake_amount (投入金额)')
    }
    if (!config.max_open_trades && config.max_open_trades !== 0) {
      errors.push('缺少 max_open_trades (最大持仓数)')
    }

    // Exchange validation
    const exchange = config.exchange as Record<string, unknown> | undefined
    if (exchange) {
      if (!exchange.key) errors.push('缺少 exchange.key (API Key)')
      if (!exchange.secret) errors.push('缺少 exchange.secret (Secret Key)')
    }

    return { valid: errors.length === 0, errors }
  },
}
