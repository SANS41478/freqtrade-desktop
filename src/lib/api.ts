import type {
  Balances, Count, Profit, ProfitAll, TradeSchema, OpenTradeSchema,
  TradeResponse, PerformanceEntry, EntryTag, ExitReason,
  Stats, DailyWeeklyMonthly, ShowConfig, LockModel, DeleteTrade,
  BacktestRequest, BacktestResponse, BacktestHistoryEntry,
  StrategyResponse, StatusMsg, ResultMsg, Version,
  SysInfo, PlotConfig, MixTag, ListCustomData, BgJobStarted,
  BacktestMarketChange, PairHistory, PairListsResponse,
  WhitelistEvaluateResponse, BackgroundTaskStatus, AvailablePairs,
  ExchangeListResponse, MarketResponse,
} from '@/types/freqtrade'

import { getApiBaseUrl, getAuthHeaders } from '@/lib/auth-config'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${await getApiBaseUrl()}${path}`, {
    headers: await getAuthHeaders(),
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
  logs: (limit?: number) =>
    request<{ log_count: number; logs: [string, number, string, string, string][] }>(
      `/logs${limit ? `?limit=${limit}` : ''}`
    ),
  sysinfo: () => request<SysInfo>('/sysinfo'),
  plotConfig: (strategy?: string) =>
    request<PlotConfig>(`/plot_config${strategy ? `?strategy=${encodeURIComponent(strategy)}` : ''}`),
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
  daily: (timescale = 7) => request<DailyWeeklyMonthly>(`/daily?timescale=${timescale}`),
  weekly: (timescale = 4) => request<DailyWeeklyMonthly>(`/weekly?timescale=${timescale}`),
  monthly: (timescale = 3) => request<DailyWeeklyMonthly>(`/monthly?timescale=${timescale}`),

  // ========== Trades ==========
  status: () => request<OpenTradeSchema[]>('/status'),
  trade: (id: number) => request<OpenTradeSchema>(`/trade/${id}`),
  trades: (limit = 50, offset = 0) =>
    request<TradeResponse>(`/trades?limit=${limit}&offset=${offset}`),
  deleteTrade: (id: number) => request<DeleteTrade>(`/trades/${id}`, { method: 'DELETE' }),
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
    leverage?: number
  }) => request<TradeSchema | StatusMsg>('/forceenter', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  forceExit: (tradeid: number | string, ordertype?: 'limit' | 'market', amount?: number, price?: number) =>
    request<ResultMsg>('/forceexit', {
      method: 'POST',
      body: JSON.stringify({ tradeid, ordertype, amount, price }),
    }),

  // ========== Whitelist / Blacklist ==========
  whitelist: () => request<{ whitelist: string[]; length: number }>('/whitelist'),
  blacklist: () => request<{ blacklist: string[]; length: number }>('/blacklist'),
  addBlacklist: (pairs: string[]) =>
    request<{ blacklist: string[] }>('/blacklist', {
      method: 'POST',
      body: JSON.stringify({ blacklist: pairs }),
    }),
  deleteBlacklist: (pairs: string[]) => {
    const params = pairs.map((p) => `pairs_to_delete=${encodeURIComponent(p)}`).join('&')
    return request<{ blacklist: string[] }>(`/blacklist?${params}`, { method: 'DELETE' })
  },

  // ========== Locks ==========
  locks: () => request<{ lock_count: number; locks: LockModel[] }>('/locks'),
  addLock: (pair: string, until: string, side = '*', reason?: string) =>
    request<{ lock_count: number; locks: LockModel[] }>('/locks', {
      method: 'POST',
      body: JSON.stringify([{ pair, side, until, reason }]),
    }),
  deleteLock: (lockid: number) =>
    request<{ lock_count: number; locks: LockModel[] }>(`/locks/${lockid}`, { method: 'DELETE' }),
  deleteLockPair: (lockid: number) =>
    request<{ lock_count: number; locks: LockModel[] }>('/locks/delete', {
      method: 'POST',
      body: JSON.stringify({ lockid }),
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
  patchBacktestHistory: (filename: string, strategy: string, notes: string) =>
    request<BacktestHistoryEntry[]>(
      `/backtest/history/${encodeURIComponent(filename)}`,
      { method: 'PATCH', body: JSON.stringify({ strategy, notes }) }
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
    erase?: boolean
    prepend_data?: boolean
    candle_types?: string[]
    trading_mode?: string
    margin_mode?: string
  }) => request<BgJobStarted>('/download_data', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  pairCandles: (pair: string, timeframe: string, limit?: number) =>
    request<PairHistory>(
      `/pair_candles?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}&limit=${limit || 500}`
    ),
  pairCandlesPost: (pair: string, timeframe: string, limit?: number, columns?: string[]) =>
    request<PairHistory>('/pair_candles', {
      method: 'POST',
      body: JSON.stringify({ pair, timeframe, limit: limit || 500, columns }),
    }),
  pairHistory: (pair: string, timeframe: string, timerange: string, strategy: string) =>
    request<PairHistory>(
      `/pair_history?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}&timerange=${encodeURIComponent(timerange)}&strategy=${encodeURIComponent(strategy)}`
    ),
  availablePairs: (timeframe?: string, stakeCurrency?: string) =>
    request<AvailablePairs>(
      `/available_pairs${timeframe ? `?timeframe=${encodeURIComponent(timeframe)}` : ''}${stakeCurrency ? `${timeframe ? '&' : '?'}stake_currency=${encodeURIComponent(stakeCurrency)}` : ''}`
    ),

  // ========== Markets ==========
  markets: () => request<MarketResponse>('/markets'),
  exchanges: () => request<ExchangeListResponse>('/exchanges'),

  // ========== Bot Control ==========
  startBot: () => request<StatusMsg>('/start', { method: 'POST' }),
  stopBot: () => request<StatusMsg>('/stop', { method: 'POST' }),
  stopBuy: () => request<StatusMsg>('/stopbuy', { method: 'POST' }),
  stopEntry: () => request<StatusMsg>('/stopentry', { method: 'POST' }),
  pauseBot: () => request<StatusMsg>('/pause', { method: 'POST' }),
  reloadConfig: () => request<StatusMsg>('/reload_config', { method: 'POST' }),

  // ========== Pairlists ==========
  pairlistAvailable: () => request<PairListsResponse>('/pairlists/available'),
  pairlistEvaluate: (pairlists: unknown[], stakeCurrency: string, blacklist: string[] = []) =>
    request<BgJobStarted>('/pairlists/evaluate', {
      method: 'POST',
      body: JSON.stringify({ pairlists, stake_currency: stakeCurrency, blacklist }),
    }),
  pairlistEvaluateResult: (jobId: string) =>
    request<WhitelistEvaluateResponse>(`/pairlists/evaluate/${jobId}`),

  // ========== Webserver / Background jobs ==========
  backgroundJobs: () => request<BackgroundTaskStatus[]>('/background'),
  clearBackgroundJobs: () =>
    request<BackgroundTaskStatus[]>('/background/clear', { method: 'DELETE' }),

  // ========== Hyperopt (loss functions, webserver mode) ==========
  listHyperoptLoss: () =>
    request<import('@/types/freqtrade').HyperoptLossListResponse>('/hyperoptloss'),
}
