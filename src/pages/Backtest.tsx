import { apiAuth } from '@/lib/auth-config'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatPercent } from '@/lib/utils'
import { Play, Square, Trash2, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { BacktestResults } from '@/components/charts/BacktestResults'
import type { BacktestRequest, BacktestResponse, BacktestHistoryEntry } from '@/types/freqtrade'

function BacktestComparison({ history }: { history: BacktestHistoryEntry[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [comparisonData, setComparisonData] = useState<Map<string, Record<string, unknown>>>(new Map())
  const [loading, setLoading] = useState(false)

  const toggleSelect = (runId: string) => {
    const next = new Set(selectedIds)
    if (next.has(runId)) next.delete(runId)
    else if (next.size < 5) next.add(runId) // max 5 for comparison
    setSelectedIds(next)
  }

  const loadComparison = async () => {
    setLoading(true)
    const results = new Map<string, Record<string, unknown>>()
    for (const entry of history) {
      if (!selectedIds.has(entry.run_id)) continue
      try {
        const filename = entry.filename || ''
        if (!filename) continue
        const resp = await fetch(
          `${apiAuth.apiBaseUrl}/backtest/history/result?filename=${encodeURIComponent(filename)}&strategy=${encodeURIComponent(entry.strategy)}`,
          { headers: { Authorization: apiAuth.basicAuthHeader } },
        )
        const data = await resp.json()
        const strat = data.backtest_result?.strategy?.[entry.strategy]
        if (strat) results.set(entry.run_id, strat as Record<string, unknown>)
      } catch { /* skip failed loads */ }
    }
    setComparisonData(results)
    setLoading(false)
  }

  const entries = history.filter((e) => selectedIds.has(e.run_id))
  const dataArr = entries.map((e) => comparisonData.get(e.run_id)).filter(Boolean) as Record<string, unknown>[]

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#f97316]" />
          策略对比分析
        </h3>
        <button
          onClick={loadComparison}
          disabled={selectedIds.size < 2 || loading}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors disabled:opacity-50"
        >
          {loading ? '加载中...' : `对比 (${selectedIds.size})`}
        </button>
      </div>

      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {history.map((entry) => (
          <button
            key={entry.run_id}
            onClick={() => toggleSelect(entry.run_id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
              selectedIds.has(entry.run_id)
                ? 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/20'
                : 'border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
            }`}
          >
            {entry.strategy}
            <span className="ml-1 text-[10px] opacity-60">
              {entry.backtest_start_time
                ? new Date(entry.backtest_start_time * 1000).toLocaleDateString('zh-CN')
                : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Comparison table */}
      {dataArr.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#8b949e] border-b border-[#21262d]">
                <th className="text-left py-2 font-medium">指标</th>
                {entries.map((e) => (
                  <th key={e.run_id} className="text-right py-2 font-medium">
                    {e.strategy}<br />
                    <span className="text-[10px] font-normal">
                      {e.backtest_start_time
                        ? new Date(e.backtest_start_time * 1000).toLocaleDateString('zh-CN')
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: '总收益率', key: 'profit_total', fmt: (v: number) => formatPercent(v) },
                { label: '总收益', key: 'profit_total_abs', fmt: (v: number) => `$${v.toFixed(2)}` },
                { label: '胜率', key: 'winrate', fmt: (v: number) => `${(v * 100).toFixed(1)}%` },
                { label: '成交笔数', key: 'total_trades', fmt: (v: number) => String(v) },
                { label: '最大回撤', key: 'max_drawdown_account', fmt: (v: number) => formatPercent(v) },
                { label: '夏普比率', key: 'sharpe', fmt: (v: number) => v.toFixed(2) },
                { label: '利润因子', key: 'profit_factor', fmt: (v: number) => v.toFixed(2) },
                { label: '平均收益率', key: 'profit_mean', fmt: (v: number) => formatPercent(v) },
                { label: 'CAGR', key: 'cagr', fmt: (v: unknown) => typeof v === 'number' ? `${v.toFixed(2)}%` : '-' },
              ].map(({ label, key, fmt }) => {
                const values = dataArr.map((d) => d[key] as number)
                // Find best value (green) and worst (red)
                const numericValues = values.filter((v) => typeof v === 'number') as number[]
                const isProfit = ['profit_total', 'profit_total_abs', 'winrate', 'sharpe', 'profit_factor', 'profit_mean', 'cagr'].includes(key)
                const best = isProfit ? Math.max(...numericValues) : Math.min(...numericValues.filter((v) => v !== undefined))

                return (
                  <tr key={key} className="border-b border-[#21262d]/50 hover:bg-[#1c2128]/50">
                    <td className="py-2 text-[#8b949e]">{label}</td>
                    {values.map((v, i) => (
                      <td
                        key={i}
                        className={`py-2 text-right font-mono ${typeof v === 'number' && v === best ? 'text-[#3fb950] font-bold' : 'text-[#e6edf3]'}`}
                      >
                        {typeof v === 'number' ? fmt(v) : '-'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedIds.size < 2 && (
        <p className="text-xs text-[#8b949e] text-center py-2">请至少选择 2 个回测记录进行对比（最多 5 个）</p>
      )}
    </div>
  )
}

export function BacktestPage() {
  const [config, setConfig] = useState<BacktestRequest>({
    strategy: 'SampleStrategy',
    timeframe: '5m',
    timeframe_detail: '1m',
    timerange: '20260301-20260520',
    max_open_trades: 5,
    stake_amount: '100',
    enable_protections: true,
  })

  const queryClient = useQueryClient()

  const { data: strategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: api.strategies,
  })

  const { data: btResult, refetch: refetchBt } = useQuery({
    queryKey: ['backtest'],
    queryFn: api.getBacktest,
    refetchInterval: (query) => {
      const data = query.state.data as BacktestResponse | undefined
      return data?.running ? 2000 : false
    },
  })

  const { data: history } = useQuery({
    queryKey: ['backtestHistory'],
    queryFn: api.backtestHistory,
  })

  const startMutation = useMutation({
    mutationFn: api.startBacktest,
    onSuccess: () => refetchBt(),
  })

  const abortMutation = useMutation({
    mutationFn: api.abortBacktest,
    onSuccess: () => refetchBt(),
  })

  const deleteHistoryMutation = useMutation({
    mutationFn: api.deleteBacktestHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtestHistory'] })

  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesTarget, setNotesTarget] = useState<{ filename: string; notes: string } | null>(null)
  const notesMutation = useMutation({
    mutationFn: ({ filename, notes }: { filename: string; notes: string }) => api.patchBacktestHistory(filename, notes),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['backtestHistory'] }); setNotesTarget(null); setEditingNotes(null); },
  })
  const marketChangeMutation = useMutation({
    mutationFn: api.backtestMarketChange,
  })

    },
  })

  const result = btResult?.backtest_result?.strategy as Record<string, number> | undefined

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">回测中心</h2>
        <p className="text-sm text-muted-foreground mt-0.5">运行历史回测，优化策略参数</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Config Form */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow space-y-4">
          <h3 className="text-sm font-semibold">回测配置</h3>

          <FormField label="策略">
            <select
              value={config.strategy}
              onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            >
              {(strategies?.strategies ?? ['SampleStrategy']).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="主时间框架">
              <select
                value={config.timeframe}
                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
              >
                {['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'].map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </FormField>
            <FormField label="明细时间框架">
              <select
                value={config.timeframe_detail}
                onChange={(e) => setConfig({ ...config, timeframe_detail: e.target.value })}
                className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
              >
                {['1m', '5m', '15m'].map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="时间范围 (YYYYMMDD-YYYYMMDD)">
            <input
              type="text"
              value={config.timerange}
              onChange={(e) => setConfig({ ...config, timerange: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="投入金额 (USDT)">
              <input
                type="text"
                value={config.stake_amount}
                onChange={(e) => setConfig({ ...config, stake_amount: e.target.value })}
                className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
              />
            </FormField>
            <FormField label="最大同时持仓">
              <input
                type="number"
                value={config.max_open_trades}
                onChange={(e) => setConfig({ ...config, max_open_trades: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={config.enable_protections}
              onChange={(e) => setConfig({ ...config, enable_protections: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-muted-foreground">启用风控保护</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => startMutation.mutate(config)}
              disabled={btResult?.running || startMutation.isPending}
              className="flex-1 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {btResult?.running ? '运行中...' : '开始回测'}
            </button>
            {btResult?.running && (
              <button
                onClick={() => abortMutation.mutate()}
                className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>

          {btResult?.running && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{btResult.step}</span>
                <span>{Math.round(btResult.progress * 100)}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${btResult.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">回测结果</h3>
            {btResult?.status === 'ended' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">已完成</span>
            )}
            {btResult?.running && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning animate-pulse">运行中</span>
            )}
          </div>

          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ResultItem label="总收益率" value={formatPercent(result.profit_total ?? 0)} trend="up" />
                <ResultItem label="总成交笔数" value={String(result.total_trades ?? 0)} />
                <ResultItem label="胜率" value={formatPercent(result.winrate ?? 0, 1)} />
                <ResultItem label="最大回撤" value={formatPercent(result.max_drawdown_account ?? 0)} trend="down" />
                <ResultItem label="夏普比率" value={(result.sharpe ?? 0).toFixed(2)} />
                <ResultItem label="利润因子" value={(result.profit_factor ?? 0).toFixed(2)} />
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                下方展示完整可视化分析
                <ChevronDown className="w-3 h-3 inline ml-1" />
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              {btResult?.status === 'not_started'
                ? '点击"开始回测"运行'
                : btResult?.status === 'error'
                  ? `错误: ${btResult.status_msg}`
                  : '等待回测结果...'}
            </p>
          )}
        </div>
      </div>

      {/* Full Visualization */}
      {btResult?.status === 'ended' && result && (
        <BacktestResults result={result} />
      )}

      {/* History */}
      <div className="bg-card border border-border rounded-lg p-5 card-glow">
        <h3 className="text-sm font-semibold mb-3">历史回测记录</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left py-2 font-medium">策略</th>
              <th className="text-left py-2 font-medium">时间框架</th>
              <th className="text-right py-2 font-medium">日期</th>
              <th className="text-right py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(history ?? []).map((entry) => (
              <tr key={entry.run_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-2.5 font-medium">{entry.strategy}</td>
                <td className="py-2.5 text-muted-foreground">{entry.timeframe ?? '-'}</td>
                <td className="py-2.5 text-right text-muted-foreground text-xs">
                  {entry.backtest_start_time
                    ? new Date(entry.backtest_start_time * 1000).toLocaleDateString('zh-CN')
                    : '-'}
                </td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => {
                      if (entry.filename && confirm(`确定删除 ${entry.strategy} 的回测记录？`)) {
                        deleteHistoryMutation.mutate(entry.filename)
                      }
                    }}
                    disabled={deleteHistoryMutation.isPending}
                    className="text-xs text-[#f85149] hover:underline flex items-center gap-1 ml-auto disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Backtest Comparison */}
      {(history ?? []).length >= 1 && (
        <BacktestComparison history={history!} />
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function ResultItem({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div className="p-3 rounded-md bg-secondary/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-bold', trend === 'up' && 'metric-up', trend === 'down' && 'metric-down')}>
        {value}
      </p>
    </div>
  )
}
