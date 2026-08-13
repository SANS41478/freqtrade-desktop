// ============================================================
// Freqtrade API v2.48 TypeScript type definitions
// Auto-derived from Pydantic schemas in freqtrade/rpc/api_server/
// ============================================================

// --- Enums ---

export type TradingMode = 'spot' | 'margin' | 'futures'
export type MarginMode = 'cross' | 'isolated' | ''
export type OrderTypeValues = 'limit' | 'market'
export type SignalDirection = 'long' | 'short'
export type SignalType = 'enter_long' | 'exit_long' | 'enter_short' | 'exit_short'
export type BacktestState = 'STARTUP' | 'DATALOAD' | 'ANALYZE' | 'CONVERT' | 'BACKTEST'
export type RPCMessageType =
  | 'status' | 'warning' | 'exception' | 'startup'
  | 'entry' | 'entry_fill' | 'entry_cancel'
  | 'exit' | 'exit_fill' | 'exit_cancel'
  | 'protection_trigger' | 'protection_trigger_global'
  | 'strategy_msg'
  | 'whitelist' | 'analyzed_df' | 'new_candle'

// --- Balance ---

export interface Balance {
  currency: string
  free: number
  balance: number
  used: number
  bot_owned: number | null
  est_stake: number
  est_stake_bot: number | null
  stake: string
  side: string
  is_position: boolean
  position: number
  is_bot_managed: boolean
}

export interface Balances {
  currencies: Balance[]
  total: number
  total_bot: number
  symbol: string
  value: number
  value_bot: number
  stake: string
  note: string
  starting_capital: number
  starting_capital_ratio: number
  starting_capital_pct: number
  starting_capital_fiat: number
  starting_capital_fiat_ratio: number
  starting_capital_fiat_pct: number
}

// --- Count ---

export interface Count {
  current: number
  max: number
  total_stake: number
}

// --- Profit ---

export interface Profit {
  profit_closed_coin: number
  profit_closed_percent_mean: number
  profit_closed_ratio_mean: number
  profit_closed_percent_sum: number
  profit_closed_ratio_sum: number
  profit_closed_percent: number
  profit_closed_ratio: number
  profit_closed_fiat: number
  profit_all_coin: number
  profit_all_percent_mean: number
  profit_all_ratio_mean: number
  profit_all_percent_sum: number
  profit_all_ratio_sum: number
  profit_all_percent: number
  profit_all_ratio: number
  profit_all_fiat: number
  trade_count: number
  closed_trade_count: number
  first_trade_date: string
  first_trade_humanized: string
  first_trade_timestamp: number
  latest_trade_date: string
  latest_trade_humanized: string
  latest_trade_timestamp: number
  avg_duration: string
  best_pair: string
  best_rate: number
  best_pair_profit_ratio: number
  best_pair_profit_abs: number
  winning_trades: number
  losing_trades: number
  profit_factor: number
  winrate: number
  expectancy: number
  expectancy_ratio: number
  sharpe: number
  sortino: number
  sqn: number
  calmar: number
  cagr: number
  max_drawdown: number
  max_drawdown_abs: number
  max_drawdown_start: string
  max_drawdown_start_timestamp: number
  max_drawdown_end: string
  max_drawdown_end_timestamp: number
  drawdown_high: number
  drawdown_low: number
  current_drawdown: number
  current_drawdown_abs: number
  current_drawdown_high: number
  current_drawdown_start: string
  current_drawdown_start_timestamp: number
  trading_volume: number | null
  bot_start_timestamp: number
  bot_start_date: string
}

export interface ProfitAll {
  all: Profit
  long: Profit | null
  short: Profit | null
}

// --- Orders ---

export interface OrderSchema {
  pair: string
  order_id: string
  status: string
  remaining: number | null
  amount: number
  safe_price: number
  cost: number
  filled: number | null
  ft_order_side: 'buy' | 'sell' | 'stoploss'
  order_type: string
  is_open: boolean
  order_timestamp: number | null
  order_filled_timestamp: number | null
  ft_fee_base: number | null
  ft_order_tag: string | null
}

// --- Trades ---

export interface TradeSchema {
  trade_id: number
  pair: string
  base_currency: string
  quote_currency: string
  is_open: boolean
  is_short: boolean
  exchange: string
  amount: number
  amount_requested: number
  stake_amount: number
  max_stake_amount: number | null
  strategy: string
  enter_tag: string | null
  timeframe: number
  fee_open: number | null
  fee_open_cost: number | null
  fee_open_currency: string | null
  fee_close: number | null
  fee_close_cost: number | null
  fee_close_currency: string | null
  open_date: string
  open_timestamp: number
  open_fill_date: string | null
  open_fill_timestamp: number | null
  open_rate: number
  open_rate_requested: number | null
  open_trade_value: number
  close_date: string | null
  close_timestamp: number | null
  close_rate: number | null
  close_rate_requested: number | null
  close_profit: number | null
  close_profit_pct: number | null
  close_profit_abs: number | null
  profit_ratio: number | null
  profit_pct: number | null
  profit_abs: number | null
  profit_fiat: number | null
  realized_profit: number
  realized_profit_ratio: number | null
  exit_reason: string | null
  exit_order_status: string | null
  stop_loss_abs: number | null
  stop_loss_ratio: number | null
  stop_loss_pct: number | null
  stoploss_last_update: string | null
  stoploss_last_update_timestamp: number | null
  initial_stop_loss_abs: number | null
  initial_stop_loss_ratio: number | null
  initial_stop_loss_pct: number | null
  min_rate: number | null
  max_rate: number | null
  nr_of_successful_entries: number
  nr_of_successful_exits: number
  has_open_orders: boolean
  orders: OrderSchema[]
  leverage: number | null
  interest_rate: number | null
  liquidation_price: number | null
  funding_fees: number | null
  trading_mode: TradingMode | null
  amount_precision: number | null
  price_precision: number | null
  precision_mode: number | null
}

export interface OpenTradeSchema extends TradeSchema {
  stoploss_current_dist: number | null
  stoploss_current_dist_pct: number | null
  stoploss_current_dist_ratio: number | null
  stoploss_entry_dist: number | null
  stoploss_entry_dist_ratio: number | null
  current_rate: number
  total_profit_abs: number
  total_profit_fiat: number | null
  total_profit_ratio: number | null
}

// --- Performance ---

export interface PerformanceEntry {
  profit_ratio: number
  profit_pct: number
  profit_abs: number
  count: number
  pair: string
  profit: number
}

export interface EntryTag {
  profit_ratio: number
  profit_pct: number
  profit_abs: number
  count: number
  enter_tag: string
}

export interface ExitReason {
  profit_ratio: number
  profit_pct: number
  profit_abs: number
  count: number
  exit_reason: string
}

// --- Stats ---

export interface SellReason {
  wins: number
  losses: number
  draws: number
}

export interface Stats {
  exit_reasons: Record<string, SellReason>
  durations: Record<string, number | null>
}

// --- Daily/Weekly/Monthly ---

export interface DailyRecord {
  date: string
  abs_profit: number
  rel_profit: number
  starting_balance: number
  fiat_value: number
  trade_count: number
}

export interface DailyWeeklyMonthly {
  data: DailyRecord[]
  fiat_display_currency: string
  stake_currency: string
}

// --- Show Config ---

export interface ShowConfig {
  version: string
  strategy_version: string | null
  api_version: number
  dry_run: boolean
  trading_mode: string
  margin_mode: string
  short_allowed: boolean
  stake_currency: string
  stake_amount: string
  available_capital: number | null
  stake_currency_decimals: number
  max_open_trades: number
  minimal_roi: Record<string, number>
  stoploss: number | null
  stoploss_on_exchange: boolean
  trailing_stop: boolean | null
  trailing_stop_positive: number | null
  trailing_stop_positive_offset: number | null
  trailing_only_offset_is_reached: boolean | null
  timeframe: string | null
  timeframe_ms: number
  timeframe_min: number
  exchange: string
  strategy: string | null
  force_entry_enable: boolean
  bot_name: string
  state: string
  runmode: string
  position_adjustment_enable: boolean
  max_entry_position_adjustment: number
}

// --- Backtest ---

export interface BacktestRequest {
  strategy: string
  timeframe?: string
  timeframe_detail?: string
  timerange?: string
  max_open_trades?: number
  stake_amount?: string | number
  enable_protections?: boolean
  dry_run_wallet?: number
  backtest_cache?: string
  freqaimodel?: string
  freqai?: { identifier: string }
}

export interface BacktestResponse {
  status: 'running' | 'ended' | 'not_started' | 'error' | 'reset'
  running: boolean
  status_msg: string
  step: string
  progress: number
  trade_count: number | null
  backtest_result: BacktestResultType | null
}

export interface BacktestResultType {
  metadata: Record<string, unknown>
  strategy: Record<string, unknown>
  strategy_comparison: unknown[]
}

export interface BacktestHistoryEntry {
  filename: string
  strategy: string
  run_id: string
  backtest_start_time: number
  notes: string
  backtest_start_ts: number | null
  backtest_end_ts: number | null
  timeframe: string | null
  timeframe_detail: string | null
}

// --- Strategy ---

export interface StrategyParameter {
  param_type: 'IntParameter' | 'RealParameter' | 'DecimalParameter' | 'BooleanParameter' | 'CategoricalParameter'
  name: string
  space: string
  load: boolean
  optimize: boolean
  value: unknown
  low?: number
  high?: number
  decimals?: number
  opt_range?: unknown[]
}

export interface StrategyResponse {
  strategy: string
  timeframe: string | null
  params: StrategyParameter[]
  code: string
}

// --- Locks ---

export interface LockModel {
  id: number
  active: boolean
  lock_end_time: string
  lock_end_timestamp: number
  lock_time: string
  lock_timestamp: number
  pair: string
  side: string
  reason: string | null
}

// --- WebSocket ---

export interface WSMessage {
  type: RPCMessageType
  data: unknown
}

export interface PairHistory {
  strategy: string
  pair: string
  timeframe: string
  timeframe_ms: number
  columns: string[]
  all_columns: string[]
  data: unknown[]
  length: number
  buy_signals: number
  sell_signals: number
  enter_long_signals: number
  exit_long_signals: number
  enter_short_signals: number
  exit_short_signals: number
  last_analyzed: string
  last_analyzed_ts: number
  data_start_ts: number
  data_start: string
  data_stop: string
  data_stop_ts: number
}

// --- API Response Wrappers ---

export interface TradeResponse {
  trades: TradeSchema[]
  trades_count: number
  offset: number
  total_trades: number
}

export interface StatusMsg {
  status: string
}

export interface ResultMsg {
  result: string
}

export interface DeleteTrade {
  cancel_order_count: number
  result: string
  result_msg: string
  trade_id: number
}

// --- Markets ---

export interface MarketModel {
  symbol: string
  base: string
  quote: string
  spot: boolean
  swap: boolean
  active: boolean
}

export interface MarketResponse {
  markets: Record<string, MarketModel>
  exchange_id: string
}

// --- Pairlists ---

export interface PairListInfo {
  name: string
  description: string
  is_pairlist_generator: boolean
  params: Record<string, unknown>
}

export interface PairListsResponse {
  pairlists: PairListInfo[]
}

export interface WhitelistEvaluateResponse {
  error?: string | null
  status: string
  result?: {
    method: string[]
    length: number
    whitelist: string[]
  } | null
}

// --- Webserver / Background jobs ---

export interface BackgroundTaskStatus {
  job_id: string
  job_category: string
  status: string
  running: boolean
  progress: number | null
  progress_tasks: Record<string, unknown> | null
  error: string | null
}

// --- Available pairs / exchanges ---

export interface AvailablePairs {
  length: number
  pairs: string[]
  pair_interval: [string, string, string][]
}

export interface ExchangeInfo {
  name: string
  valid: boolean
  is_spot: boolean
  is_margin: boolean
  is_futures: boolean
  modes: string[]
}

export interface ExchangeListResponse {
  exchanges: ExchangeInfo[]
}

export interface Version {
  version: string
}

// ============================================================
// Hyperopt
// ============================================================

export interface HyperoptRequest {
  strategy: string
  epochs: number
  spaces: string
  loss?: string | null
  timerange?: string | null
  timeframe?: string | null
  jobs: number
  randomized_search: boolean
  max_open_trades?: number | null
  stake_amount?: string | null
  enable_protections: boolean
  analyze_per_epoch: boolean
}

export interface HyperoptResponse {
  status: 'running' | 'ended' | 'not_started' | 'error'
  running: boolean
  status_msg: string
  progress: number
  current_epoch: number | null
  total_epochs: number | null
  best_loss: number | null
  hyperopt_result: Record<string, unknown> | null
}

export interface HyperoptHistoryEntry {
  filename: string
  strategy: string
  run_id: string
  hyperopt_start_time: number
  notes: string | null
  epochs: number | null
  best_loss: number | null
}

export interface HyperoptLossItem {
  name: string
  description: string
}

export interface HyperoptLossListResponse {
  loss_functions: HyperoptLossItem[]
}

// --- SysInfo ---

export interface SysInfo {
  cpu_pct: number[]
  cpu_load: Array<{ cpu: number; pct: number }>
  cpu_load_avg: Record<string, number>
  cpu_count: number
  cpu_avg: number
  ram_pct: number
}

// --- Plot Config ---

export interface PlotConfig {
  plot_config: Record<string, unknown> | null
}

// --- MixTag ---

export interface MixTag {
  mix_tag: string
  profit_ratio: number
  profit_pct: number
  profit_abs: number
  count: number
}

// --- Backtest Market Change ---

export interface BacktestMarketChange {
  columns: string[]
  length: number
  data: unknown[][]
}

// --- Custom Data ---

export interface CustomDataEntry {
  key: string
  type: string
  value: unknown
  created_at: string
  updated_at: string | null
}

export interface ListCustomData {
  trade_id: number
  custom_data: CustomDataEntry[]
}

// --- BgJobStarted ---

export interface BgJobStarted {
  job_id: string
  status: string
}
