import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatPercent, formatDuration } from '@/lib/utils'
import { Download, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { ForceExitButton } from '@/components/trading/ForceExitButton'

type SortKey = 'pair' | 'profit' | 'profitPct' | 'duration' | 'date'
type SortDir = 'asc' | 'desc'

export function TradesPage({ onTradeClick }: { onTradeClick?: (tradeId: number) => void }) {
  const [pairFilter, setPairFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data } = useQuery({
    queryKey: ['trades', limit, page * limit],
    queryFn: () => api.trades(limit, page * limit),
  })

  const allTrades = data?.trades ?? []
  const total = data?.total_trades ?? 0

  const availablePairs = useMemo(() => {
    const pairs = new Set(allTrades.map((t) => t.pair))
    return [...pairs].sort()
  }, [allTrades])

  const filteredTrades = useMemo(() => {
    let result = allTrades.filter((t) => {
      if (pairFilter && t.pair !== pairFilter) return false
      if (directionFilter === 'long' && t.is_short) return false
      if (directionFilter === 'short' && !t.is_short) return false
      const isWin = (t.close_profit_abs ?? 0) >= 0
      if (resultFilter === 'win' && !isWin) return false
      if (resultFilter === 'loss' && isWin) return false
      if (searchText) {
        const tag = (t.enter_tag ?? '').toLowerCase()
        const reason = (t.exit_reason ?? '').toLowerCase()
        const s = searchText.toLowerCase()
        if (!tag.includes(s) && !reason.includes(s)) return false
      }
      if (dateFrom && t.open_timestamp) {
        const openDate = new Date(t.open_timestamp * 1000).toISOString().slice(0, 10)
        if (openDate < dateFrom) return false
      }
      if (dateTo && t.open_timestamp) {
        const openDate = new Date(t.open_timestamp * 1000).toISOString().slice(0, 10)
        if (openDate > dateTo) return false
      }
      return true
    })

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'pair': cmp = a.pair.localeCompare(b.pair); break
        case 'profit': cmp = (a.close_profit_abs ?? 0) - (b.close_profit_abs ?? 0); break
        case 'profitPct': cmp = (a.close_profit_pct ?? 0) - (b.close_profit_pct ?? 0); break
        case 'duration': {
          const aDur = a.open_timestamp && a.close_timestamp ? a.close_timestamp - a.open_timestamp : 0
          const bDur = b.open_timestamp && b.close_timestamp ? b.close_timestamp - b.open_timestamp : 0
          cmp = aDur - bDur; break
        }
        case 'date': cmp = (a.open_timestamp ?? 0) - (b.open_timestamp ?? 0); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [allTrades, pairFilter, directionFilter, resultFilter, searchText, dateFrom, dateTo, sortKey, sortDir])

  const summaryStats = useMemo(() => {
    if (allTrades.length === 0) return null
    const wins = allTrades.filter((t) => (t.close_profit_abs ?? 0) >= 0).length
    const losses = allTrades.filter((t) => (t.close_profit_abs ?? 0) < 0).length
    const totalProfit = allTrades.reduce((s, t) => s + (t.close_profit_abs ?? 0), 0)
    return { wins, losses, totalProfit, winrate: (wins / allTrades.length) * 100 }
  }, [allTrades])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'desc' : 'desc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
  }

  const handleExportCSV = () => {
    const headers = ['ID', '交易对', '方向', '入场价', '出场价', '数量', '盈亏', '收益率', '持仓(分钟)', '入场标签', '出场原因', '入场时间', '出场时间']
    const rows = filteredTrades.map((t) => {
      const dur = t.open_timestamp && t.close_timestamp
        ? Math.round((t.close_timestamp - t.open_timestamp) / 60000)
        : 0
      return [
        t.trade_id, t.pair, t.is_short ? 'short' : 'long', t.open_rate,
        t.close_rate ?? '', t.amount ?? '', t.close_profit_abs?.toFixed(4) ?? '0',
        `${((t.close_profit_pct ?? 0) * 100).toFixed(2)}%`, dur,
        t.enter_tag ?? '', t.exit_reason ?? '',
        t.open_timestamp ? new Date(t.open_timestamp).toISOString() : '',
        t.close_timestamp ? new Date(t.close_timestamp).toISOString() : '',
      ]
    })
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freqtrade_trades_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">交易记录</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} 笔成交{filteredTrades.length !== allTrades.length && `（已筛选 ${filteredTrades.length} 笔）`}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出 CSV
        </button>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-center card-glow">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">总交易</p>
            <p className="text-sm font-bold">{total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-center card-glow">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">盈利</p>
            <p className="text-sm font-bold metric-up">{summaryStats.wins}</p>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-center card-glow">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">亏损</p>
            <p className="text-sm font-bold metric-down">{summaryStats.losses}</p>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-center card-glow">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">总盈亏</p>
            <p className={cn('text-sm font-bold font-mono', summaryStats.totalProfit >= 0 ? 'metric-up' : 'metric-down')}>
              {formatCurrency(summaryStats.totalProfit)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg px-3 py-2 text-center card-glow">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">胜率</p>
            <p className="text-sm font-bold">{summaryStats.winrate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索标签/出场原因..."
            className="pl-7 pr-3 py-1.5 rounded-md text-sm bg-secondary border border-border placeholder-muted-foreground w-48"
          />
        </div>
        <select value={pairFilter} onChange={(e) => setPairFilter(e.target.value)} className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border">
          <option value="">全部交易对</option>
          {availablePairs.map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select value={directionFilter} onChange={(e) => setDirectionFilter(e.target.value)} className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border">
          <option value="">全部方向</option>
          <option value="long">多头</option>
          <option value="short">空头</option>
        </select>
        <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border">
          <option value="">全部结果</option>
          <option value="win">盈利</option>
          <option value="loss">亏损</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border" placeholder="开始日期" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 rounded-md text-sm bg-secondary border border-border" placeholder="结束日期" />
      </div>

      {/* Trades Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('pair')}>
                  <span className="flex items-center gap-1">交易对 <SortIcon column="pair" /></span>
                </th>
                <th className="text-left py-3 px-4 font-medium">方向</th>
                <th className="text-right py-3 px-4 font-medium">入场价</th>
                <th className="text-right py-3 px-4 font-medium">出场价</th>
                <th className="text-right py-3 px-4 font-medium">数量</th>
                <th className="text-right py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('profit')}>
                  <span className="flex items-center justify-end gap-1">盈亏 <SortIcon column="profit" /></span>
                </th>
                <th className="text-right py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('profitPct')}>
                  <span className="flex items-center justify-end gap-1">收益率 <SortIcon column="profitPct" /></span>
                </th>
                <th className="text-right py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('duration')}>
                  <span className="flex items-center justify-end gap-1">持仓时长 <SortIcon column="duration" /></span>
                </th>
                <th className="text-right py-3 px-4 font-medium">标签</th>
                <th className="text-right py-3 px-4 font-medium">出场原因</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    {allTrades.length === 0 ? '暂无交易记录' : '没有匹配的交易'}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isWin = (trade.close_profit_abs ?? 0) >= 0
                  const duration = trade.open_timestamp && trade.close_timestamp
                    ? formatDuration(Math.round((trade.close_timestamp - trade.open_timestamp) / 60000))
                    : '-'
                  return (
                    <tr
                      key={trade.trade_id}
                      onClick={() => onTradeClick?.(trade.trade_id)}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{trade.trade_id}</td>
                      <td className="py-2.5 px-4 font-medium">{trade.pair}</td>
                      <td className="py-2.5 px-4">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', trade.is_short ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success')}>
                          {trade.is_short ? '空头' : '多头'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs">{formatCurrency(trade.open_rate)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs">{trade.close_rate ? formatCurrency(trade.close_rate) : '-'}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs">{trade.amount?.toFixed(4) ?? '-'}</td>
                      <td className={cn('py-2.5 px-4 text-right font-medium', isWin ? 'metric-up' : 'metric-down')}>
                        {formatCurrency(trade.close_profit_abs ?? 0)}
                      </td>
                      <td className={cn('py-2.5 px-4 text-right', isWin ? 'metric-up' : 'metric-down')}>
                        {formatPercent(trade.close_profit_pct ?? 0)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">{duration}</td>
                      <td className="py-2.5 px-4 text-right">
                        {trade.enter_tag ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{trade.enter_tag}</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground text-xs">
                        {trade.exit_reason ?? '-'}
                        {trade.is_open && (
                          <span className="ml-2 inline-block" onClick={(e) => e.stopPropagation()}>
                            <ForceExitButton tradeId={trade.trade_id} pair={trade.pair} />
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>显示 {total > 0 ? page * limit + 1 : 0}-{Math.min((page + 1) * limit, total)} 条，共 {total} 条</span>
        <div className="flex gap-1">
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded border border-border hover:bg-secondary transition-colors disabled:opacity-50">上一页</button>
          <button disabled={(page + 1) * limit >= total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-border hover:bg-secondary transition-colors disabled:opacity-50">下一页</button>
        </div>
      </div>
    </div>
  )
}