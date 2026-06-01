import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn, formatCurrency, formatPercent, formatDuration } from "@/lib/utils"
import { TrendingUp, Users, Target, Shield, Activity, BarChart3, ArrowRight } from "lucide-react"
import { EquityChart } from "@/components/charts/EquityChart"
import { useLiveTrades } from "@/hooks/useWebSocket"
import { ForceEntryForm } from "@/components/trading/ForceEntryForm"
import { ForceExitButton } from "@/components/trading/ForceExitButton"
import { PriceTicker } from "@/components/charts/PriceTicker"
import type { OpenTradeSchema, DailyRecord, DailyWeeklyMonthly, PerformanceEntry, EntryTag, ExitReason } from "@/types/freqtrade"
import type { TabId } from "@/App"

export function Dashboard({ onNavigate, onTradeClick }: {
  onNavigate: (tab: TabId) => void
  onTradeClick?: (tradeId: number) => void
}) {
  const { data: balance } = useQuery({ queryKey: ["balance"], queryFn: api.balance, refetchInterval: 10000 })
  const { data: count } = useQuery({ queryKey: ["count"], queryFn: api.count, refetchInterval: 5000 })
  const { data: profit } = useQuery({ queryKey: ["profit"], queryFn: api.profit, refetchInterval: 30000 })
  const { data: status } = useQuery({ queryKey: ["status"], queryFn: api.status, refetchInterval: 5000 })
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ["daily"],
    queryFn: api.daily,
    refetchInterval: 60000,
  })
  const { data: weeklyData } = useQuery({ queryKey: ["weekly"], queryFn: api.weekly, refetchInterval: 120000 })
  const { data: monthlyData } = useQuery({ queryKey: ["monthly"], queryFn: api.monthly, refetchInterval: 120000 })
  const { data: tradesData } = useQuery({ queryKey: ["trades"], queryFn: () => api.trades(10, 0) })
  const { data: whitelist } = useQuery({ queryKey: ["whitelist"], queryFn: api.whitelist })
  const { data: performance } = useQuery({ queryKey: ["performance"], queryFn: api.performance, refetchInterval: 60000 })
  const { data: entryTags } = useQuery({ queryKey: ["entries"], queryFn: api.entries, refetchInterval: 60000 })
  const { data: exitReasons } = useQuery({ queryKey: ["exits"], queryFn: api.exits, refetchInterval: 60000 })

  const pairs = whitelist?.whitelist ?? ["BTC/USDT", "ETH/USDT"]
  const liveTrades = useLiveTrades()
  const restTrades = (status ?? []) as OpenTradeSchema[]
  const openTrades = restTrades.map((t) => liveTrades.get(t.trade_id) ?? t)
  const recentTrades = tradesData?.trades?.slice(0, 5) ?? []
  const dailyRecords = (dailyData?.data ?? []) as DailyRecord[]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">交易仪表盘</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profit
              ? `${profit.trade_count} 笔成交 · 最后更新 ${new Date(profit.latest_trade_timestamp * 1000).toLocaleTimeString("zh-CN")}`
              : "实时监控策略运行状态"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          运行中
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="总权益"
          value={formatCurrency(balance?.total ?? 0)}
          sub={balance ? `${formatCurrency(balance.value, "USD")} USD` : "未连接"}
          icon={TrendingUp}
          trend={balance && balance.total > (balance.starting_capital ?? 0) ? "up" : "down"}
        />
        <MetricCard
          title="持仓中"
          value={String(count?.current ?? 0)}
          sub={`最大限制 ${count?.max ?? "-"} 笔`}
          icon={Users}
        />
        <MetricCard
          title="胜率"
          value={profit ? formatPercent(profit.winrate, 1) : "-"}
          sub={profit ? `${profit.winning_trades} 胜 / ${profit.losing_trades} 负` : "-"}
          icon={Target}
          trend={profit ? (profit.winrate >= 0.5 ? "up" : "down") : undefined}
        />
        <MetricCard
          title="夏普比率"
          value={profit?.sharpe?.toFixed(2) ?? "-"}
          sub={profit ? `索提诺 ${profit.sortino.toFixed(2)} · 利润因子 ${profit.profit_factor.toFixed(2)}` : "-"}
          icon={Shield}
        />
      </div>

      {/* Price Ticker */}
      <PriceTicker pairs={pairs} />

      {/* Chart + Open Positions + Force Entry */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <EquityChart data={dailyRecords} isLoading={dailyLoading} />
        </div>
        <div className="space-y-4">
          <ForceEntryForm />
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-card border border-border rounded-lg p-4 card-glow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">当前持仓 ({openTrades.length})</h3>
          {openTrades.length > 0 && (
            <button
              onClick={() => onNavigate("trades")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {openTrades.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">暂无持仓</p>
        ) : (
          <div className="space-y-2">
            {openTrades.map((trade) => {
              const totalProfit = trade.total_profit_abs ?? 0
              const totalProfitPct = trade.total_profit_ratio ?? 0
              const unrealized = trade.profit_ratio ?? trade.total_profit_ratio ?? 0
              return (
                <div
                  key={trade.trade_id}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                  onClick={() => onTradeClick?.(trade.trade_id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{trade.pair}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      trade.is_short ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                    )}>
                      {trade.is_short ? "空" : "多"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{trade.strategy}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    入场: <span className="font-mono text-foreground">{formatCurrency(trade.open_rate)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    数量: <span className="font-mono text-foreground">{trade.amount?.toFixed(4)}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("text-sm font-mono font-medium", totalProfit >= 0 ? "metric-up" : "metric-down")}>
                        {formatCurrency(totalProfit)}
                      </p>
                      <p className={cn("text-[10px] font-mono", totalProfit >= 0 ? "metric-up" : "metric-down")}>
                        {formatPercent(unrealized)}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <ForceExitButton tradeId={trade.trade_id} pair={trade.pair} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Performance Table */}
      {performance && performance.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 card-glow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              交易对绩效排名
            </h3>
            <span className="text-xs text-muted-foreground">{performance.length} 个交易对</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">盈利最多</p>
              <div className="space-y-1.5">
                {performance.slice(0, 5).sort((a, b) => b.profit_abs - a.profit_abs).map((p) => (
                  <div key={p.pair} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-secondary/30">
                    <span className="text-xs font-mono">{p.pair}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{p.count} 笔</span>
                      <span className="text-xs font-mono metric-up">{formatPercent(p.profit_pct)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">亏损最多</p>
              <div className="space-y-1.5">
                {performance.slice().sort((a, b) => a.profit_abs - b.profit_abs).slice(0, 5).map((p) => (
                  <div key={p.pair} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-secondary/30">
                    <span className="text-xs font-mono">{p.pair}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{p.count} 笔</span>
                      <span className={cn("text-xs font-mono", p.profit_pct >= 0 ? "metric-up" : "metric-down")}>
                        {formatPercent(p.profit_pct)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Tags & Exit Reasons */}
      <div className="grid grid-cols-2 gap-4">
        {entryTags && entryTags.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 card-glow">
            <h3 className="text-sm font-semibold mb-3">入场标签分析</h3>
            <div className="space-y-1.5">
              {entryTags.slice(0, 8).sort((a, b) => b.count - a.count).map((tag) => (
                <div key={tag.enter_tag || "empty"} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-secondary/30">
                  <span className="text-xs">{tag.enter_tag || "(无标签)"}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">{tag.count} 笔</span>
                    <span className={cn("text-xs font-mono", tag.profit_ratio >= 0 ? "metric-up" : "metric-down")}>
                      {formatPercent(tag.profit_ratio)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {exitReasons && exitReasons.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 card-glow">
            <h3 className="text-sm font-semibold mb-3">出场原因统计</h3>
            <div className="space-y-1.5">
              {exitReasons.sort((a, b) => b.count - a.count).slice(0, 8).map((exit) => (
                <div key={exit.exit_reason} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-secondary/30">
                  <span className="text-xs">{exit.exit_reason}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">{exit.count} 笔</span>
                    <span className={cn("text-xs font-mono", exit.profit_ratio >= 0 ? "metric-up" : "metric-down")}>
                      {formatPercent(exit.profit_ratio)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Trades */}
      <div className="bg-card border border-border rounded-lg p-4 card-glow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">最近成交</h3>
          <button
            onClick={() => onNavigate("trades")}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left py-2 font-medium">交易对</th>
              <th className="text-left py-2 font-medium">方向</th>
              <th className="text-right py-2 font-medium">盈亏</th>
              <th className="text-right py-2 font-medium">收益率</th>
              <th className="text-right py-2 font-medium">持仓时长</th>
              <th className="text-right py-2 font-medium">日期</th>
            </tr>
          </thead>
          <tbody>
            {recentTrades.map((trade) => (
              <tr
                key={trade.trade_id}
                onClick={() => onTradeClick?.(trade.trade_id)}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="py-2.5 font-medium">{trade.pair}</td>
                <td className="py-2.5">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    trade.is_short ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                  )}>
                    {trade.is_short ? "空头" : "多头"}
                  </span>
                </td>
                <td className={cn(
                  "py-2.5 text-right font-medium",
                  (trade.close_profit_abs ?? 0) >= 0 ? "metric-up" : "metric-down",
                )}>
                  {formatCurrency(trade.close_profit_abs ?? 0)}
                </td>
                <td className={cn(
                  "py-2.5 text-right",
                  (trade.close_profit_pct ?? 0) >= 0 ? "metric-up" : "metric-down",
                )}>
                  {formatPercent(trade.close_profit_pct ?? 0)}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {trade.open_timestamp && trade.close_timestamp
                    ? formatDuration(Math.round((trade.close_timestamp - trade.open_timestamp) / 60))
                    : "-"}
                </td>
                <td className="py-2.5 text-right text-muted-foreground text-xs">
                  {trade.close_date ?? "-"}
                </td>
              </tr>
            ))}
            {recentTrades.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  暂无成交记录 — 启动 Freqtrade 交易后自动显示
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Weekly & Monthly Profit */}
      <div className="grid grid-cols-2 gap-4">
        <ProfitTable title="每周收益" data={weeklyData} />
        <ProfitTable title="每月收益" data={monthlyData} />
      </div>
    </div>
  )
}

function MetricCard({
  title, value, sub, icon: Icon, trend,
}: {
  title: string
  value: string
  sub: string
  icon: typeof Activity
  trend?: "up" | "down"
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 card-glow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className={cn(
        "text-2xl font-bold",
        trend === "up" && "metric-up",
        trend === "down" && "metric-down",
      )}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>
    </div>
  )
}

function ProfitTable({ title, data }: { title: string; data: DailyWeeklyMonthly | undefined }) {
  const entries = data?.data ?? []
  if (entries.length === 0) return null
  return (
    <div className="bg-card border border-border rounded-lg p-4 card-glow">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left py-1.5 font-medium">周期</th>
            <th className="text-right py-1.5 font-medium">收益</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(-12).reverse().map((record) => (
            <tr key={record.date} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
              <td className="py-1.5 text-xs font-mono text-muted-foreground">{record.date}</td>
              <td className={cn("py-1.5 text-xs font-mono text-right", record.rel_profit >= 0 ? "metric-up" : "metric-down")}>
                {record.rel_profit >= 0 ? "+" : ""}{(record.rel_profit * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

