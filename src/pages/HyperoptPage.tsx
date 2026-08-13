import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'
import { Zap, Play, Square, Trash2, Terminal } from 'lucide-react'
import type { HyperoptRequest } from '@/types/freqtrade'

const SPACES = ['buy', 'sell', 'roi', 'stoploss', 'trailing', 'protection']
const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d']

interface HyperoptProgress {
  running: boolean
  current: number | null
  total: number | null
  bestLoss: number | null
  status: 'idle' | 'running' | 'ended' | 'error' | 'stopping'
  statusMsg: string
}

interface HyperoptHistoryEntry {
  filename: string
  strategy: string
  best_loss: number | null
  epochs: number | null
  hyperopt_start_time: number | null
  notes: string | null
}

const parseProgressLine = (
  line: string,
  progress: HyperoptProgress,
): HyperoptProgress => {
  let next = { ...progress }

  // Epoch progress: "123/300" or "Epoch 123/300" or "1/100: ..."
  const epochMatch = line.match(/(?:epoch\s+)?(\d+)\s*\/\s*(\d+)/i)
  if (epochMatch) {
    next.current = Number(epochMatch[1])
    next.total = Number(epochMatch[2])
    next.status = 'running'
    next.statusMsg = line.trim().slice(0, 120)
  }

  // Best loss: "Best loss: -0.123456" / "best result: -0.123" / "Loss: 0.0123456"
  const lossMatch = line.match(/best\s+(?:loss|result)[:\s]+([-+]?\d+(?:\.\d+)?)/i)
    || line.match(/^\s*loss[:\s]+([-+]?\d+(?:\.\d+)?)/i)
  if (lossMatch) {
    const loss = Number(lossMatch[1])
    if (progress.bestLoss === null || loss < progress.bestLoss) {
      next.bestLoss = loss
    }
  }

  return next
}

export function HyperoptPage() {
  const isElectron = !!window.electronAPI

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

  const [progress, setProgress] = useState<HyperoptProgress>({
    running: false,
    current: null,
    total: null,
    bestLoss: null,
    status: 'idle',
    statusMsg: '',
  })
  const [consoleLines, setConsoleLines] = useState<string[]>([])
  const [history, setHistory] = useState<HyperoptHistoryEntry[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  const { data: strategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: api.strategies,
    retry: 1,
  })

  const { data: lossFunctions } = useQuery({
    queryKey: ['hyperoptLoss'],
    queryFn: api.listHyperoptLoss,
    retry: 1,
  })

  const loadHistory = useCallback(async () => {
    if (!window.electronAPI) return
    setHistoryError(null)
    try {
      const result = await window.electronAPI.hyperoptList()
      if (result.success && result.files) {
        setHistory(result.files)
      } else {
        setHistoryError(result.error ?? '无法加载优化历史')
      }
    } catch (e) {
      setHistoryError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (!window.electronAPI) return

    const onStdout = (msg: string) => {
      setConsoleLines((prev) => [...prev.slice(-500), msg.trimEnd()])
      setProgress((prev) => parseProgressLine(msg, prev))
    }
    const onStderr = (msg: string) => {
      setConsoleLines((prev) => [...prev.slice(-500), `[STDERR] ${msg.trimEnd()}`])
    }
    const onClosed = (code: number | null) => {
      setProgress((prev) => {
        const finished = prev.total !== null && prev.current !== null && prev.current >= prev.total
        return {
          ...prev,
          running: false,
          status: finished ? 'ended' : code === 0 ? 'ended' : 'error',
          statusMsg: code === 0 ? '优化已完成' : `进程已退出 (code ${code})`,
        }
      })
      loadHistory()
    }

    window.electronAPI.onHyperoptStdout(onStdout)
    window.electronAPI.onHyperoptStderr(onStderr)
    window.electronAPI.onHyperoptClosed(onClosed)
  }, [loadHistory])

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleLines])

  useEffect(() => {
    if (!window.electronAPI) return
    let mounted = true
    window.electronAPI.hyperoptIsRunning().then((running) => {
      if (!mounted || !running) return
      setProgress((prev) => ({ ...prev, running: true, status: 'running' }))
    })
    return () => { mounted = false }
  }, [])

  const toggleSpace = (space: string) => {
    const current = config.spaces ? config.spaces.split(',').filter(Boolean) : []
    const next = current.includes(space) ? current.filter((s) => s !== space) : [...current, space]
    setConfig({ ...config, spaces: next.join(',') })
  }

  const handleStart = async () => {
    if (!window.electronAPI) return
    setActionError(null)
    setConsoleLines([])
    setProgress({
      running: true,
      current: null,
      total: config.epochs,
      bestLoss: null,
      status: 'running',
      statusMsg: '启动优化中...',
    })
    const result = await window.electronAPI.hyperoptStart({
      strategy: config.strategy,
      epochs: config.epochs,
      spaces: config.spaces || 'buy,sell,roi,stoploss',
      loss: config.loss,
      timerange: config.timerange || null,
      timeframe: config.timeframe || null,
      jobs: config.jobs,
      randomized_search: config.randomized_search,
      enable_protections: config.enable_protections,
    })
    if (!result.success) {
      setProgress((prev) => ({ ...prev, running: false, status: 'error', statusMsg: result.error ?? '启动失败' }))
      setActionError(result.error ?? '启动失败')
    }
  }

  const handleStop = async () => {
    if (!window.electronAPI) return
    setActionError(null)
    const result = await window.electronAPI.hyperoptStop()
    if (!result.success) setActionError(result.error ?? '停止失败')
    else setProgress((prev) => ({ ...prev, status: 'stopping', statusMsg: '正在停止...' }))
  }

  const handleDelete = async (filename: string) => {
    if (!window.electronAPI) return
    if (!confirm(`确定删除此优化记录？`)) return
    setDeleting(filename)
    setActionError(null)
    try {
      const result = await window.electronAPI.hyperoptDelete(filename)
      if (result.success) {
        setHistory((prev) => prev.filter((h) => h.filename !== filename))
      } else {
        setActionError(result.error ?? '删除失败')
      }
    } finally {
      setDeleting(null)
    }
  }

  const progressPct = progress.total && progress.current
    ? Math.min(progress.current / progress.total, 1)
    : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">超参优化</h2>
        <p className="text-sm text-[#8b949e] mt-0.5">通过 CLI 后台运行 freqtrade hyperopt，优化策略参数</p>
      </div>

      {!isElectron && (
        <div className="p-4 rounded-lg border border-[#d2991d]/30 bg-[#d2991d]/10 text-sm text-[#d2991d]">
          超参优化通过桌面端进程管理运行，请在 Electron 桌面版中使用此功能。
        </div>
      )}

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
              disabled={progress.running}
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] disabled:opacity-50"
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
                disabled={progress.running}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">时间框架</label>
              <select
                value={config.timeframe ?? '5m'}
                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                disabled={progress.running}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] disabled:opacity-50"
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
              disabled={progress.running}
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] disabled:opacity-50"
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
                    disabled={progress.running}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors disabled:opacity-50 ${
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
              disabled={progress.running}
              placeholder="留空使用全部数据"
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] placeholder-[#8b949e] font-mono disabled:opacity-50"
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
                disabled={progress.running}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] disabled:opacity-50"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.randomized_search}
                  onChange={(e) => setConfig({ ...config, randomized_search: e.target.checked })}
                  disabled={progress.running}
                  className="rounded border-[#21262d]"
                />
                随机搜索
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleStart}
              disabled={!isElectron || progress.running}
              className="flex-1 py-2 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {progress.running ? '优化中...' : '开始优化'}
            </button>
            {progress.running && (
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-md text-sm font-medium border border-[#21262d] hover:bg-[#1c2128] transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>

          {actionError && (
            <p className="text-xs text-[#f85149]">{actionError}</p>
          )}

          {/* Progress */}
          {progress.running && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#8b949e]">
                <span>Epoch {progress.current ?? 0} / {progress.total ?? '?'}</span>
                <span>{Math.round(progressPct * 100)}%</span>
              </div>
              <div className="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct * 100}%` }}
                />
              </div>
              {progress.statusMsg && (
                <p className="text-xs text-[#8b949e] font-mono truncate" title={progress.statusMsg}>{progress.statusMsg}</p>
              )}
              {progress.bestLoss != null && (
                <p className="text-xs text-[#8b949e]">当前最佳 Loss: <span className="text-[#f97316] font-mono">{progress.bestLoss.toFixed(6)}</span></p>
              )}
            </div>
          )}

          {/* Console output */}
          {consoleLines.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3" /> 实时输出
              </label>
              <div
                ref={consoleRef}
                className="h-40 overflow-y-auto bg-[#0d1117] border border-[#21262d] rounded-md p-2 font-mono text-[10px] leading-relaxed text-[#8b949e]"
              >
                {consoleLines.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">优化结果</h3>
            {progress.status === 'ended' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#3fb950]/10 text-[#3fb950]">已完成</span>
            )}
            {progress.running && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#d2991d]/10 text-[#d2991d] animate-pulse">运行中</span>
            )}
            {(progress.status === 'error' || progress.status === 'stopping') && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f85149]/10 text-[#f85149]">
                {progress.status === 'stopping' ? '停止中' : '错误'}
              </span>
            )}
          </div>

          {progress.status === 'error' ? (
            <p className="text-sm text-[#f85149]">{progress.statusMsg || '优化失败，请查看下方实时输出'}</p>
          ) : progress.bestLoss != null || progress.current != null ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="最佳 Loss" value={progress.bestLoss != null ? progress.bestLoss.toFixed(6) : '-'} />
                <MetricCard label="已完成轮数" value={`${progress.current ?? 0}${progress.total ? ` / ${progress.total}` : ''}`} />
              </div>
              {progress.statusMsg && (
                <p className="text-xs text-[#8b949e]">{progress.statusMsg}</p>
              )}
              <p className="text-xs text-[#8b949e] leading-relaxed">
                优化结束后，最佳参数会保存在
                <code className="text-[#f97316] font-mono"> user_data/hyperopt_results/ </code>
                的 JSON 文件中。可在下方历史记录中查看。
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#8b949e] text-center py-12">
              {progress.status === 'running'
                ? '等待优化输出...'
                : '点击"开始优化"运行超参优化（需桌面版）'}
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">优化历史记录</h3>
          <button
            onClick={loadHistory}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128] transition-colors"
          >
            刷新
          </button>
        </div>
        {historyError ? (
          <p className="text-sm text-[#f85149] text-center py-6">{historyError}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-[#8b949e] text-center py-6">
            {isElectron ? '暂无历史优化记录' : '优化历史仅在桌面版可用'}
          </p>
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
              {history.map((entry) => (
                <tr key={entry.filename} className="border-b border-[#21262d]/50 hover:bg-[#1c2128]">
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
                      onClick={() => handleDelete(entry.filename)}
                      disabled={deleting === entry.filename}
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
