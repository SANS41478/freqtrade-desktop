import type {
  Balances, Count, Profit, ProfitAll, TradeSchema, OpenTradeSchema,
  TradeResponse, PerformanceEntry, EntryTag, ExitReason,
  Stats, DailyWeeklyMonthly, ShowConfig, LockModel,
  BacktestRequest, BacktestResponse, BacktestHistoryEntry,
  StrategyResponse, StatusMsg, ResultMsg, Version,
  SysInfo, PlotConfig, MixTag, ListCustomData, BgJobStarted,
  BacktestMarketChange, PairHistory,
} from '@/types/freqtrade'

const API_BASE = 'http://127.0.0.1:8080/api/v1'

const AUTH_HEADERS = {
  'Authorization': 'Basic ' + btoa('freqtrader:SuperSecurePassword'),
  'Content-Type': 'application/json',
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: AUTH_HEADERS,
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

export const api = {
  // ========== Info ==========
  ping: () => request<{ status: string }>('/ping'),
  version: () => request<Version>('/version'),
  showConfig: () => request<ShowConfig>('/show_config'),
  health: () => request<{
    last_process: string | null
    last_process_ts: number | null
    bot_start: string | null
    bot_start_ts: number | null
    bot_startup: string | null
    bot_startup_ts: number | null
  }>('/health'),
  logs: () => request<{ log_count: number; logs: [string, number, string, string, string][] }>('/logs'),
  sysinfo: () => request<SysInfo>('/sysinfo'),
  plotConfig: () => request<PlotConfig>('/plot_config'),
  mixTags: () => request<MixTag[]>('/mix_tags'),

  // ========== Trading Info ==========
  balance: () => request<Balances>('/balance'),
  count: () => request<Count>('/count'),
  profit: () => request<Profit>('/profit'),
  profitAll: () => request<ProfitAll>('/profit_all'),
  performance: () => request<PerformanceEntry[]>('/performance'),
  entries: () => request<EntryTag[]>('/entries'),
  exits: () => request<ExitReason[]>('/exits'),
  stats: () => request<Stats>('/stats'),
  daily: () => request<DailyWeeklyMonthly>('/daily'),
  weekly: () => request<DailyWeeklyMonthly>('/weekly'),
  monthly: () => request<DailyWeeklyMonthly>('/monthly'),

  // ========== Trades ==========
  status: () => request<OpenTradeSchema[]>('/status'),
  trade: (id: number) => request<OpenTradeSchema>(`/trade/${id}`),
  trades: (limit = 50, offset = 0) =>
    request<TradeResponse>(`/trades?limit=${limit}&offset=${offset}`),
  deleteTrade: (id: number) => request<StatusMsg>(`/trades/${id}`, { method: 'DELETE' }),
  cancelOpenOrder: (id: number) =>
    request<OpenTradeSchema>(`/trades/${id}/open-order`, { method: 'DELETE' }),
  reloadTrade: (id: number) =>
    request<OpenTradeSchema>(`/trade/${id}/reload`, { method: 'POST' }),

  // ========== Custom Data ==========
  openTradeCustomData: () => request<ListCustomData[]>('/trades/open/custom-data'),
  tradeCustomData: (tradeId: number) =>
    request<ListCustomData[]>(`/trades/${tradeId}/custom-data`),

  // ========== Actions ==========
  forceEnter: (payload: {
    pair: string
    side?: 'long' | 'short'
    price?: number
    ordertype?: 'limit' | 'market'
    stakeamount?: number
    entry_tag?: string
  }) => request<StatusMsg>('/forceenter', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  forceExit: (tradeid: number | string, ordertype?: 'limit' | 'market') =>
    request<ResultMsg>('/forceexit', {
      method: 'POST',
      body: JSON.stringify({ tradeid, ordertype }),
    }),

  // ========== Whitelist / Blacklist ==========
  whitelist: () => request<{ whitelist: string[]; length: number }>('/whitelist'),
  blacklist: () => request<{ blacklist: string[]; length: number }>('/blacklist'),
  addBlacklist: (pairs: string[]) =>
    request<{ blacklist: string[] }>('/blacklist', {
      method: 'POST',
      body: JSON.stringify({ blacklist: pairs }),
    }),
  deleteBlacklist: (pairs: string[]) =>
    request<{ blacklist: string[] }>('/blacklist', {
      method: 'DELETE',
      body: JSON.stringify({ blacklist: pairs }),
    }),

  // ========== Locks ==========
  locks: () => request<{ lock_count: number; locks: LockModel[] }>('/locks'),
  addLock: (pair: string, until: string, side = '*', reason?: string) =>
    request<{ lock_count: number }>('/locks', {
      method: 'POST',
      body: JSON.stringify({ pair, side, until, reason }),
    }),
  deleteLock: (lockid: number) =>
    request<{ lock_count: number }>(`/locks/${lockid}`, { method: 'DELETE' }),
  deleteLocksBulk: (lockIds: number[]) =>
    request<{ lock_count: number }>('/locks/delete', {
      method: 'POST',
      body: JSON.stringify({ lockids: lockIds }),
    }),

  // ========== Backtest ==========
  startBacktest: (req: BacktestRequest) =>
    request<BacktestResponse>('/backtest', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  getBacktest: () => request<BacktestResponse>('/backtest'),
  deleteBacktest: () => request<BacktestResponse>('/backtest', { method: 'DELETE' }),
  abortBacktest: () => request<BacktestResponse>('/backtest/abort'),
  backtestHistory: () => request<BacktestHistoryEntry[]>('/backtest/history'),
  deleteBacktestHistory: (filename: string) =>
    request<BacktestHistoryEntry[]>(`/backtest/history/${filename}`, { method: 'DELETE' }),
  backtestResultDetail: (filename: string, strategy: string) =>
    request<BacktestResponse>(
      `/backtest/history/result?filename=${encodeURIComponent(filename)}&strategy=${encodeURIComponent(strategy)}`
    ),
  backtestMarketChange: (filename: string) =>
    request<BacktestMarketChange>(
      `/backtest/history/${encodeURIComponent(filename)}/market_change`
    ),
  patchBacktestHistory: (filename: string, notes: string) =>
    request<BacktestHistoryEntry[]>(
      `/backtest/history/${encodeURIComponent(filename)}`,
      { method: 'PATCH', body: JSON.stringify({ notes }) }
    ),

  // ========== Strategies ==========
  strategies: () => request<{ strategies: string[] }>('/strategies'),
  strategy: (name: string) => request<StrategyResponse>(`/strategy/${name}`),

  // ========== Data ==========
  downloadData: (payload: {
    pairs: string[]
    timeframes: string[]
    exchange?: string
    days?: number
    timerange?: string
    dataformat_ohlcv?: string
  }) => request<StatusMsg>('/download_data', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  pairCandles: (pair: string, timeframe: string, limit?: number) =>
    request<PairHistory>(
      `/pair_candles?pair=${pair}&timeframe=${timeframe}&limit=${limit || 500}`
    ),
  pairCandlesPost: (pair: string, timeframe: string, limit?: number) =>
    request<PairHistory>('/pair_candles', {
      method: 'POST',
      body: JSON.stringify({ pair, timeframe, limit: limit || 500 }),
    }),

  // ========== Markets ==========
  markets: () => request<{ markets: Record<string, unknown> }>('/markets'),

  // ========== Bot Control ==========
  startBot: () => request<StatusMsg>('/start', { method: 'POST' }),
  stopBot: () => request<StatusMsg>('/stop', { method: 'POST' }),
  stopBuy: () => request<StatusMsg>('/stopbuy', { method: 'POST' }),
  stopEntry: () => request<StatusMsg>('/stopentry', { method: 'POST' }),
  pauseBot: () => request<StatusMsg>('/pause', { method: 'POST' }),
  reloadConfig: () => request<StatusMsg>('/reload_config', { method: 'POST' }),

  // ========== Pairlists ==========
  pairlistAvailable: () =>
    request<{ pairlists: Array<{ name: string; available: boolean }> }>('/pairlists/available'),
  pairlistEvaluate: (pairlists: unknown[]) =>
    request<BgJobStarted>('/pairlists/evaluate', {
      method: 'POST',
      body: JSON.stringify({ pairlists }),
    }),

  // ========== Hyperopt ==========
  startHyperopt: (req: import('@/types/freqtrade').HyperoptRequest) =>
    request<import('@/types/freqtrade').HyperoptResponse>('/hyperopt', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  getHyperopt: () => request<import('@/types/freqtrade').HyperoptResponse>('/hyperopt'),
  deleteHyperopt: () =>
    request<import('@/types/freqtrade').HyperoptResponse>('/hyperopt', { method: 'DELETE' }),
  abortHyperopt: () =>
    request<import('@/types/freqtrade').HyperoptResponse>('/hyperopt/abort'),
  hyperoptHistory: () => request<import('@/types/freqtrade').HyperoptHistoryEntry[]>('/hyperopt/history'),
  deleteHyperoptHistory: (filename: string) =>
    request<import('@/types/freqtrade').HyperoptHistoryEntry[]>(
      `/hyperopt/history/${filename}`, { method: 'DELETE' }
    ),
  listHyperoptLoss: () =>
    request<import('@/types/freqtrade').HyperoptLossListResponse>('/hyperopt/loss'),
}