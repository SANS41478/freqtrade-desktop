import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CandleChart } from '@/components/charts/CandleChart'
import { CandlestickChart, RefreshCw } from 'lucide-react'

const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d']
const LIMITS = [100, 200, 500, 1000]

function timestampToDateStr(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function Candles() {
  const [pair, setPair] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('5m')
  const [limit, setLimit] = useState(500)
  const [showSignals, setShowSignals] = useState(true)

  const { data: whitelist } = useQuery({
    queryKey: ['whitelist'],
    queryFn: api.whitelist,
  })

  const pairs = whitelist?.whitelist ?? ['BTC/USDT', 'ETH/USDT']

  const { data: candlesData, isLoading, error, refetch } = useQuery({
    queryKey: ['pairCandles', pair, timeframe, limit],
    queryFn: () => api.pairCandles(pair, timeframe, limit),
  })

  const chartData = useMemo(() => {
    if (!candlesData?.data || !candlesData?.columns) return []

    const cols = candlesData.columns
    const dateIdx = cols.indexOf('date')
    const openIdx = cols.indexOf('open')
    const highIdx = cols.indexOf('high')
    const lowIdx = cols.indexOf('low')
    const closeIdx = cols.indexOf('close')
    const volumeIdx = cols.indexOf('volume')

    return (candlesData.data as number[][]).map((row) => ({
      time: timestampToDateStr(row[dateIdx]),
      open: row[openIdx],
      high: row[highIdx],
      low: row[lowIdx],
      close: row[closeIdx],
      volume: volumeIdx >= 0 ? row[volumeIdx] : undefined,
    }))
  }, [candlesData])

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">K线图表</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {chartData.length > 0 ? `${pair} · ${timeframe} · ${chartData.length} 根K线` : '查看历史价格走势'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          刷新
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">交易对</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border font-mono"
          >
            {pairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">时间框架</label>
          <div className="flex gap-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  timeframe === tf
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">K线数量</label>
          <div className="flex gap-0.5">
            {LIMITS.map((l) => (
              <button
                key={l}
                onClick={() => setLimit(l)}
                className={`px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  limit === l
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">信号</label>
          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showSignals
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'bg-secondary text-muted-foreground border border-transparent'
            }`}
          >
            {showSignals ? '隐藏' : '显示'}
          </button>
        </div>
      </div>

      {/* Chart */}
      {error ? (
        <div className="flex-1 flex items-center justify-center text-destructive text-sm">
          加载失败: {(error as Error).message}
        </div>
      ) : (
        <div className="flex-1 min-h-[400px]">
          <CandleChart
            data={chartData}
            showSignals={showSignals}
            isLoading={isLoading}
            error={error ? String((error as { message?: string }).message ?? error) : undefined}
          />
        </div>
      )}
    </div>
  )
}