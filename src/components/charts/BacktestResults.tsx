import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Line, Cell,
  PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { BarChart3, TrendingDown, PieChartIcon, Calendar, Activity, Target } from 'lucide-react'

type VizTab = 'equity' | 'pairs' | 'monthly' | 'analysis' | 'trades'

interface BacktestResultsProps {
  result: Record<string, unknown>
}

export function BacktestResults({ result }: BacktestResultsProps) {
  const [tab, setTab] = useState<VizTab>('equity')

  // Parse daily profit data
  const dailyData = useMemo(() => {
    const raw = (result.daily_profit as [string, number][]) ?? []
    let cumulative = 0
    let peak = -Infinity
    return raw.map(([date, profit]) => {
      cumulative += profit
      peak = Math.max(peak, cumulative)
      const drawdown = peak > 0 ? (cumulative - peak) / peak : 0
      return {
        date,
        profit: Math.round(profit * 10000) / 10000,
        equity: Math.round(cumulative * 10000) / 10000,
        drawdown: Math.round(drawdown * 10000) / 10000,
      }
    })
  }, [result])

  // Per-pair data
  const pairData = useMemo(() => {
    const raw = (result.results_per_pair as Record<string, unknown>[]) ?? []
    return raw
      .filter((p) => p.key !== 'TOTAL')
      .map((p) => ({
        pair: p.key as string,
        profit: Math.round(((p.profit_total_abs as number) ?? 0) * 100) / 100,
        pct: Math.round(((p.profit_total as number) ?? 0) * 10000) / 100,
        trades: (p.trade_count as number) ?? 0,
        winrate: Math.round(((p.winrate as number) ?? 0) * 1000) / 10,
      }))
      .sort((a, b) => b.profit - a.profit)
  }, [result])

  // Monthly returns
  const monthlyData = useMemo(() => {
    const raw = result.periodic_breakdown as Record<string, [string, number][]> | undefined
    const monthly = raw?.['month'] ?? raw?.['months'] ?? []
    return monthly.map(([month, pct]: [string, number]) => ({
      month,
      return: Math.round(pct * 10000) / 100,
    }))
  }, [result])

  // Exit reasons
  const exitReasons = useMemo(() => {
    const raw = (result.exit_reason_summary as Record<string, unknown>[]) ?? []
    return raw.map((r) => ({
      reason: r.key as string,
      wins: (r.wins as number) ?? 0,
      losses: (r.losses as number) ?? 0,
      count: ((r.wins as number) ?? 0) + ((r.losses as number) ?? 0),
    }))
  }, [result])

  // Trades for scatter plot
  const tradesScatter = useMemo(() => {
    const raw = (result.trades as Record<string, unknown>[]) ?? []
    return raw.map((t) => ({
      id: t.trade_id as number,
      pair: t.pair as string,
      profit: Math.round(((t.close_profit_abs as number) ?? 0) * 100) / 100,
      pct: Math.round(((t.close_profit_pct as number) ?? 0) * 10000) / 100,
      duration: t.open_timestamp && t.close_timestamp
        ? Math.round(((t.close_timestamp as number) - (t.open_timestamp as number)) / 3600 * 10) / 10
        : 0,
      isWin: ((t.close_profit_abs as number) ?? 0) >= 0,
    }))
  }, [result])

  // Stats
  const stats = {
    totalTrades: result.total_trades as number ?? 0,
    wins: result.wins as number ?? 0,
    losses: result.losses as number ?? 0,
    winrate: result.winrate as number ?? 0,
    profitTotal: result.profit_total as number ?? 0,
    profitAbs: result.profit_total_abs as number ?? 0,
    maxDrawdown: result.max_drawdown_account as number ?? 0,
    sharpe: result.sharpe as number ?? 0,
    sortino: result.sortino as number ?? 0,
    calmar: result.calmar as number ?? 0,
    profitFactor: result.profit_factor as number ?? 0,
    cagr: result.cagr as number ?? 0,
    avgDuration: result.holding_avg as string ?? '-',
    bestDay: result.backtest_best_day as number ?? 0,
    worstDay: result.backtest_worst_day as number ?? 0,
    winningDays: result.winning_days as number ?? 0,
    losingDays: result.losing_days as number ?? 0,
    maxConsecWins: result.max_consecutive_wins as number ?? 0,
    maxConsecLosses: result.max_consecutive_losses as number ?? 0,
  }

  const tabs: { id: VizTab; label: string; icon: typeof Activity }[] = [
    { id: 'equity', label: '权益曲线', icon: Activity },
    { id: 'pairs', label: '交易对分析', icon: BarChart3 },
    { id: 'monthly', label: '月度收益', icon: Calendar },
    { id: 'analysis', label: '交易分析', icon: PieChartIcon },
    { id: 'trades', label: '逐笔明细', icon: Target },
  ]

  return (
    <div className="space-y-4">
      {/* Summary stats row */}
      <div className="grid grid-cols-6 gap-3">
        <MiniStat label="总收益率" value={formatPercent(stats.profitTotal)} positive={stats.profitTotal >= 0} />
        <MiniStat label="总盈亏" value={formatCurrency(stats.profitAbs)} positive={stats.profitAbs >= 0} />
        <MiniStat label="胜率" value={`${(stats.winrate * 100).toFixed(1)}%`} />
        <MiniStat label="夏普" value={stats.sharpe.toFixed(2)} />
        <MiniStat label="最大回撤" value={formatPercent(stats.maxDrawdown)} positive={false} />
        <MiniStat label="利润因子" value={stats.profitFactor.toFixed(2)} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-border rounded-lg p-4 card-glow">
        {tab === 'equity' && <EquityDrawdownChart data={dailyData} stats={stats} />}
        {tab === 'pairs' && <PairPerformanceChart data={pairData} />}
        {tab === 'monthly' && <MonthlyReturnsChart data={monthlyData} />}
        {tab === 'analysis' && <TradeAnalysisCharts stats={stats} exitReasons={exitReasons} trades={tradesScatter} />}
        {tab === 'trades' && <TradeDetailTable trades={tradesScatter} />}
      </div>
    </div>
  )
}

// ============================================================
// Equity + Drawdown Chart
// ============================================================

function EquityDrawdownChart({ data, stats }: { data: { date: string; equity: number; drawdown: number }[]; stats: { maxDrawdown: number; profitTotal: number; bestDay: number; worstDay: number } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">权益曲线 & 回撤</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>最大回撤: <span className="text-destructive font-medium">{formatPercent(stats.maxDrawdown)}</span></span>
          <span>最佳日: <span className="text-success font-medium">{formatPercent(stats.bestDay)}</span></span>
          <span>最差日: <span className="text-destructive font-medium">{formatPercent(stats.worstDay)}</span></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(215 25% 16%)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: string) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}` }}
            interval="preserveStartEnd" />
          <YAxis yAxisId="equity" tick={{ fontSize: 10, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => `${v.toFixed(2)}`} width={55} />
          <YAxis yAxisId="dd" orientation="right" tick={{ fontSize: 10, fill: 'hsl(0 84% 60%)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} width={45} domain={['dataMin', 0]} />
          <Tooltip content={<ChartTooltip />} />
          <Area yAxisId="equity" type="monotone" dataKey="equity" stroke="hsl(217 91% 60%)" strokeWidth={2}
            fill="url(#equityGrad)" dot={false} />
          <Area yAxisId="dd" type="monotone" dataKey="drawdown" stroke="hsl(0 84% 60%)" strokeWidth={1.5}
            fill="url(#drawdownGrad)" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================
// Per-Pair Performance
// ============================================================

function PairPerformanceChart({ data }: { data: { pair: string; profit: number; pct: number; trades: number; winrate: number }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">交易对盈亏分布</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
          <CartesianGrid stroke="hsl(215 25% 16%)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => formatCurrency(v)} />
          <YAxis type="category" dataKey="pair" tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false} width={65} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
                <p className="font-medium mb-1">{d.pair}</p>
                <p>盈亏: <span className={d.profit >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrency(d.profit)}</span></p>
                <p>收益率: {d.pct.toFixed(2)}%</p>
                <p>成交: {d.trades} 笔</p>
                <p>胜率: {d.winrate}%</p>
              </div>
            )
          }} />
          <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================
// Monthly Returns
// ============================================================

function MonthlyReturnsChart({ data }: { data: { month: string; return: number }[] }) {
  // Group into years for a heatmap-like display
  const yearGroups = useMemo(() => {
    const map = new Map<string, { month: string; return: number }[]>()
    data.forEach((d) => {
      const [year] = d.month.split('-')
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(d)
    })
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [data])

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">暂无月度数据</p>
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">月度收益矩阵</h3>
      <div className="space-y-2">
        {yearGroups.slice(0, 4).map(([year, months]) => (
          <div key={year} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 text-right font-medium">{year}</span>
            <div className="flex gap-1">
              {months.map((m) => {
                const isPositive = m.return >= 0
                const intensity = Math.min(Math.abs(m.return) / 20, 1)
                return (
                  <div
                    key={m.month}
                    className="w-10 h-8 rounded flex items-center justify-center text-xs font-mono cursor-default"
                    style={{
                      backgroundColor: isPositive
                        ? `hsla(142, 71%, 45%, ${0.15 + intensity * 0.7})`
                        : `hsla(0, 84%, 60%, ${0.15 + intensity * 0.7})`,
                      color: isPositive
                        ? `hsl(142, 71%, ${35 + intensity * 30}%)`
                        : `hsl(0, 84%, ${50 + intensity * 25}%)`,
                    }}
                    title={`${m.month}: ${m.return.toFixed(2)}%`}
                  >
                    {m.return.toFixed(1)}%
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart alternative */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3">月度收益趋势</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.slice(-24)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid stroke="hsl(215 25% 16%)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false}
              tickFormatter={(v: string) => v.substring(5)} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false}
              tickFormatter={(v: number) => `${v}%`} width={45} />
            <Tooltip />
            <Bar dataKey="return" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.return >= 0 ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)'} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// Trade Analysis
// ============================================================

function TradeAnalysisCharts({ stats, exitReasons, trades }: {
  stats: { wins: number; losses: number; winrate: number; winningDays: number; losingDays: number; maxConsecWins: number; maxConsecLosses: number; avgDuration: string }
  exitReasons: { reason: string; wins: number; losses: number; count: number }[]
  trades: { profit: number; pct: number; duration: number; isWin: boolean }[]
}) {
  const pieData = [
    { name: '盈利', value: stats.wins, fill: 'hsl(142 71% 45%)' },
    { name: '亏损', value: stats.losses, fill: 'hsl(0 84% 60%)' },
  ]

  // Profit distribution buckets
  const buckets = useMemo(() => {
    const pcts = trades.map((t) => t.pct)
    const min = Math.floor(Math.min(...pcts, 0))
    const max = Math.ceil(Math.max(...pcts, 0))
    const step = Math.max(Math.ceil((max - min) / 20), 0.5)
    const dist: { range: string; count: number; fill: string }[] = []
    for (let i = min; i < max; i += step) {
      const count = pcts.filter((p) => p >= i && p < i + step).length
      if (count > 0) {
        dist.push({
          range: `${i.toFixed(1)}%`,
          count,
          fill: i >= 0 ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)',
        })
      }
    }
    return dist
  }, [trades])

  return (
    <div className="space-y-6">
      {/* Win/Loss pie + Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">盈亏分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name}: ${value} 笔`} labelLine={false}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="hsl(224 71% 6%)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold mb-3">关键统计</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatItem label="胜率" value={`${(stats.winrate * 100).toFixed(1)}%`} />
            <StatItem label="平均持仓" value={stats.avgDuration} />
            <StatItem label="盈利天数" value={String(stats.winningDays)} />
            <StatItem label="亏损天数" value={String(stats.losingDays)} />
            <StatItem label="最大连赢" value={String(stats.maxConsecWins)} />
            <StatItem label="最大连亏" value={String(stats.maxConsecLosses)} />
          </div>
        </div>
      </div>

      {/* Profit distribution histogram */}
      {buckets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">收益率分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={buckets} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid stroke="hsl(215 25% 16%)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 65%)' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {buckets.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Exit reason breakdown */}
      {exitReasons.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">出场原因分析</h3>
          <div className="space-y-1.5">
            {exitReasons.map((r) => (
              <div key={r.reason} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 truncate">{r.reason}</span>
                <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-success/60 transition-all"
                    style={{ width: `${(r.wins / Math.max(r.count, 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-destructive/60 transition-all"
                    style={{ width: `${(r.losses / Math.max(r.count, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {r.wins}W / {r.losses}L
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Trade Detail Table
// ============================================================

function TradeDetailTable({ trades }: { trades: { id: number; pair: string; profit: number; pct: number; duration: number; isWin: boolean }[] }) {
  const [sort, setSort] = useState<'profit' | 'pct' | 'duration'>('profit')
  const [sortDir, setSortDir] = useState<-1 | 1>(-1)
  const [pairFilter, setPairFilter] = useState('')

  const pairs = [...new Set(trades.map((t) => t.pair))]

  const sorted = useMemo(() => {
    let filtered = trades
    if (pairFilter) {
      filtered = trades.filter((t) => t.pair === pairFilter)
    }
    return [...filtered].sort((a, b) => (a[sort] - b[sort]) * sortDir)
  }, [trades, sort, sortDir, pairFilter])

  const toggleSort = (key: typeof sort) => {
    if (sort === key) setSortDir((d) => (d === 1 ? -1 : 1) as -1 | 1)
    else { setSort(key); setSortDir(-1) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">逐笔交易明细</h3>
        <select
          value={pairFilter}
          onChange={(e) => setPairFilter(e.target.value)}
          className="px-2 py-1 rounded text-xs bg-secondary border border-border text-foreground"
        >
          <option value="">全部交易对</option>
          {pairs.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left py-2 font-medium">#</th>
              <th className="text-left py-2 font-medium">交易对</th>
              <th className="text-left py-2 font-medium">结果</th>
              <th className="text-right py-2 font-medium cursor-pointer select-none" onClick={() => toggleSort('profit')}>
                盈亏 {sort === 'profit' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th className="text-right py-2 font-medium cursor-pointer select-none" onClick={() => toggleSort('pct')}>
                收益率 {sort === 'pct' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th className="text-right py-2 font-medium cursor-pointer select-none" onClick={() => toggleSort('duration')}>
                持仓(h) {sort === 'duration' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-1.5 text-muted-foreground text-xs">{t.id}</td>
                <td className="py-1.5 font-medium text-xs">{t.pair}</td>
                <td className="py-1.5">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded', t.isWin ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                    {t.isWin ? '赢' : '亏'}
                  </span>
                </td>
                <td className={cn('py-1.5 text-right font-mono text-xs', t.profit >= 0 ? 'metric-up' : 'metric-down')}>
                  {formatCurrency(t.profit)}
                </td>
                <td className={cn('py-1.5 text-right font-mono text-xs', t.pct >= 0 ? 'metric-up' : 'metric-down')}>
                  {t.pct.toFixed(2)}%
                </td>
                <td className="py-1.5 text-right text-muted-foreground font-mono text-xs">{t.duration.toFixed(1)}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// Shared Components
// ============================================================

function MiniStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-sm font-bold', positive === true && 'metric-up', positive === false && 'metric-down')}>
        {value}
      </p>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-2 rounded bg-secondary/50">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const date = label ? new Date(label).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1.5">{date}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            {entry.name === 'equity' ? '累计权益' : entry.name === 'drawdown' ? '回撤' : entry.name}
          </span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name === 'drawdown' ? `${(entry.value * 100).toFixed(2)}%` : entry.value.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  )
}
