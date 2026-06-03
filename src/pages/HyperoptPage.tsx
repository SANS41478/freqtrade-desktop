import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Zap, Play, Square, Trash2 } from 'lucide-react'
import type { HyperoptRequest, HyperoptResponse, HyperoptHistoryEntry } from '@/types/freqtrade'

const SPACES = ['buy', 'sell', 'roi', 'stoploss', 'trailing', 'protection']
const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d']

export function HyperoptPage() {
  const queryClient = useQueryClient()
  const [config, setConfig] = useState<HyperoptRequest>({
    strategy: 'SampleStrategy',
    epochs: 100,
    spaces: 'buy,sell,roi,stoploss',
    loss: null,
    timerange: '',
    timeframe: '5m',
    jobs: -1,
    randomized_search: false,
    enable_protections: true,
    analyze_per_epoch: false,
  })

  const { data: strategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: api.strategies,
  })

  const { data: lossFunctions } = useQuery({
    queryKey: ['hyperoptLoss'],
    queryFn: api.listHyperoptLoss,
  })

  const { data: htResult, refetch: refetchHt } = useQuery({
    queryKey: ['hyperopt'],
    queryFn: api.getHyperopt,
    refetchInterval: (query) => {
      const data = query.state.data as HyperoptResponse | undefined
      return data?.running ? 3000 : false
    },
  })

  const { data: history } = useQuery({
    queryKey: ['hyperoptHistory'],
    queryFn: api.hyperoptHistory,
  })

  const startMutation = useMutation({
    mutationFn: api.startHyperopt,
    onSuccess: () => refetchHt(),
  })

  const abortMutation = useMutation({
    mutationFn: api.abortHyperopt,
    onSuccess: () => refetchHt(),
  })

  const deleteHistoryMutation = useMutation({
    mutationFn: api.deleteHyperoptHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hyperoptHistory"] }),
  })

  const toggleSpace = (space: string) => {
    const current = config.spaces ? config.spaces.split(',').filter(Boolean) : []
    const next = current.includes(space) ? current.filter((s) => s !== space) : [...current, space]
    setConfig({ ...config, spaces: next.join(',') })
  }

  const result = htResult?.hyperopt_result as Record<string, unknown> | null
  const bestParams = result?.params_details as Record<string, Record<string, unknown>> | undefined

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">超参优化</h2>
        <p className="text-sm text-[#8b949e] mt-0.5">优化策略参数以寻找最佳配置</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Config Form */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold">优化配置</h3>

          {/* Strategy */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">策略</label>
            <select
              value={config.strategy}
              onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
            >
              {(strategies?.strategies ?? ['SampleStrategy']).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Epochs + Timeframe */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">迭代轮数</label>
              <input
                type="number"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) || 100 })}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">时间框架</label>
              <select
                value={config.timeframe ?? '5m'}
                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loss function */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">目标函数</label>
            <select
              value={config.loss ?? ''}
              onChange={(e) => setConfig({ ...config, loss: e.target.value || null })}
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
            >
              <option value="">默认 (ShortTradeDurHyperOptLoss)</option>
              {(lossFunctions?.loss_functions ?? []).map((l) => (
                <option key={l.name} value={l.name}>{l.name} — {l.description}</option>
              ))}
            </select>
          </div>

          {/* Spaces */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">优化空间</label>
            <div className="flex flex-wrap gap-1.5">
              {SPACES.map((space) => {
                const active = config.spaces?.includes(space)
                return (
                  <button
                    key={space}
                    onClick={() => toggleSpace(space)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/20'
                        : 'bg-[#0d1117] border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
                    }`}
                  >
                    {space}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Timerange */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">时间范围 (YYYYMMDD-YYYYMMDD，可选)</label>
            <input
              type="text"
              value={config.timerange ?? ''}
              onChange={(e) => setConfig({ ...config, timerange: e.target.value || null })}
              placeholder="留空使用全部数据"
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] placeholder-[#8b949e] font-mono"
            />
          </div>

          {/* Jobs + random state */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">并行数 (-1=全核)</label>
              <input
                type="number"
                value={config.jobs}
                onChange={(e) => setConfig({ ...config, jobs: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.randomized_search}
                  onChange={(e) => setConfig({ ...config, randomized_search: e.target.checked })}
                  className="rounded border-[#21262d]"
                />
                随机搜索
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => startMutation.mutate(config)}
              disabled={htResult?.running || startMutation.isPending}
              className="flex-1 py-2 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {htResult?.running ? '优化中...' : '开始优化'}
            </button>
            {htResult?.running && (
              <button
                onClick={() => abortMutation.mutate()}
                className="px-4 py-2 rounded-md text-sm font-medium border border-[#21262d] hover:bg-[#1c2128] transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress */}
          {htResult?.running && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#8b949e]">
                <span>Epoch {htResult.current_epoch ?? 0} / {htResult.total_epochs ?? '?'}</span>
                <span>{Math.round(htResult.progress * 100)}%</span>
              </div>
              <div className="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full transition-all duration-500"
                  style={{ width: `${htResult.progress * 100}%` }}
                />
              </div>
              {htResult.best_loss != null && (
                <p className="text-xs text-[#8b949e]">当前最佳 Loss: <span className="text-[#f97316] font-mono">{htResult.best_loss.toFixed(6)}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">优化结果</h3>
            {htResult?.status === 'ended' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#3fb950]/10 text-[#3fb950]">已完成</span>
            )}
            {htResult?.running && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#d2991d]/10 text-[#d2991d] animate-pulse">运行中</span>
            )}
            {htResult?.status === 'error' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f85149]/10 text-[#f85149]">错误</span>
            )}
          </div>

          {htResult?.status === 'error' ? (
            <p className="text-sm text-[#f85149]">{htResult.status_msg}</p>
          ) : (result && htResult) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="最佳 Loss" value={(htResult.best_loss ?? 0).toFixed(6)} />
                <MetricCard label="总轮数" value={String(htResult.total_epochs ?? '-')} />
                {typeof result.profit_total_abs === 'number' && (
                  <MetricCard label="总收益" value={formatCurrency(result.profit_total_abs as number)} />
                )}
                {typeof result.total_trades === 'number' && (
                  <MetricCard label="成交笔数" value={String(result.total_trades)} />
                )}
              </div>

              {/* Best Parameters */}
              {bestParams && (
                <div>
                  <h4 className="text-xs font-semibold text-[#8b949e] mb-2 uppercase tracking-wider">最佳参数</h4>
                  <div className="space-y-1">
                    {Object.entries(bestParams).map(([space, params]) => (
                      <div key={space}>
                        <span className="text-[10px] text-[#8b949e] uppercase">{space}</span>
                        <div className="grid grid-cols-2 gap-1 mt-0.5">
                          {Object.entries(params).map(([k, v]) => (
                            <div key={k} className="flex justify-between bg-[#0d1117] rounded px-2 py-1">
                              <span className="text-xs text-[#8b949e] font-mono">{k}</span>
                              <span className="text-xs text-[#f97316] font-mono">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#8b949e] text-center py-12">
              {htResult?.status === 'not_started'
                ? '点击"开始优化"运行超参优化'
                : htResult?.status === 'running'
                  ? '等待优化结果...'
                  : '暂无优化结果'}
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">优化历史记录</h3>
        {(history ?? []).length === 0 ? (
          <p className="text-sm text-[#8b949e] text-center py-6">暂无历史优化记录</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#8b949e] border-b border-[#21262d]">
                <th className="text-left py-2 font-medium">策略</th>
                <th className="text-left py-2 font-medium">轮数</th>
                <th className="text-right py-2 font-medium">最佳 Loss</th>
                <th className="text-right py-2 font-medium">日期</th>
                <th className="text-right py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {(history ?? []).map((entry) => (
                <tr key={entry.run_id} className="border-b border-[#21262d]/50 hover:bg-[#1c2128]">
                  <td className="py-2.5 font-medium text-[#e6edf3]">{entry.strategy}</td>
                  <td className="py-2.5 text-[#8b949e]">{entry.epochs ?? '-'}</td>
                  <td className="py-2.5 text-right font-mono text-[#f97316]">{entry.best_loss?.toFixed(6) ?? '-'}</td>
                  <td className="py-2.5 text-right text-xs text-[#8b949e]">
                    {entry.hyperopt_start_time
                      ? new Date(entry.hyperopt_start_time * 1000).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`确定删除此优化记录？`)) {
                          deleteHistoryMutation.mutate(entry.filename)
                        }
                      }}
                      className="text-xs text-[#f85149] hover:underline flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3">
      <p className="text-xs text-[#8b949e] mb-1">{label}</p>
      <p className="text-lg font-bold font-mono text-[#e6edf3]">{value}</p>
    </div>
  )
}
