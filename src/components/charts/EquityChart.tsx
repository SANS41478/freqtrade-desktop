import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Bar,
} from 'recharts'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { DailyRecord } from '@/types/freqtrade'

type Range = '1W' | '1M' | '3M' | 'ALL'

interface EquityChartProps {
  data: DailyRecord[]
  isLoading: boolean
}

export function EquityChart({ data, isLoading }: EquityChartProps) {
  const [range, setRange] = useState<Range>('1M')

  const filteredData = useMemo(() => {
    if (!data.length) return []
    const now = new Date(data[data.length - 1].date)
    const cutoff = new Date(now)
    switch (range) {
      case '1W': cutoff.setDate(cutoff.getDate() - 7); break
      case '1M': cutoff.setDate(cutoff.getDate() - 30); break
      case '3M': cutoff.setDate(cutoff.getDate() - 90); break
      case 'ALL': return data
    }
    return data.filter((d) => new Date(d.date) >= cutoff)
  }, [data, range])

  const chartData = useMemo(() => {
    let running = 0
    return filteredData.map((d) => {
      running += d.abs_profit
      return {
        date: d.date,
        equity: Math.round(running * 100) / 100,
        profit: Math.round(d.abs_profit * 100) / 100,
        trades: d.trade_count,
      }
    })
  }, [filteredData])

  const totalProfit = chartData.length > 0 ? chartData[chartData.length - 1].equity : 0
  const isPositive = totalProfit >= 0

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 card-glow">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-secondary rounded" />
          <div className="h-64 bg-secondary/50 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">权益曲线</h3>
          <p className={cn('text-lg font-bold mt-0.5', isPositive ? 'metric-up' : 'metric-down')}>
            {formatCurrency(totalProfit)} <span className="text-xs font-normal text-muted-foreground">累计盈亏</span>
          </p>
        </div>
        <div className="flex gap-1">
          {(['1W', '1M', '3M', 'ALL'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-2.5 py-1 rounded text-xs transition-colors',
                range === r
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          暂无数据 — 连接 Freqtrade 后自动显示
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(215 25% 16%)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="equity"
              tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={60}
            />
            <YAxis
              yAxisId="trades"
              orientation="right"
              tick={{ fontSize: 11, fill: 'hsl(215 20% 65%)' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              yAxisId="equity"
              type="monotone"
              dataKey="equity"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(217 91% 60%)', stroke: 'hsl(224 71% 4%)', strokeWidth: 2 }}
            />
            <Bar
              yAxisId="trades"
              dataKey="trades"
              fill="hsl(217 91% 60%)"
              opacity={0.15}
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">累计权益</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/15" />
          <span className="text-xs text-muted-foreground">日成交笔数</span>
        </div>
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const date = label ? new Date(label).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : ''
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1.5">{date}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            {entry.name === 'equity' ? '累计盈亏' : '成交笔数'}
          </span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name === 'equity' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}
