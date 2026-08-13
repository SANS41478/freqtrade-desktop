import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { List, Play, Loader2, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react'

export function PairlistPage() {
  const [selectedPairlists, setSelectedPairlists] = useState<string[]>(['VolumePairList'])
  const [evaluating, setEvaluating] = useState(false)
  const [jobResult, setJobResult] = useState<{
    status: string
    whitelist?: string[]
    method?: string[]
    error?: string
  } | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: available, isLoading: loadingAvailable, refetch: refetchAvailable } = useQuery({
    queryKey: ['pairlistAvailable'],
    queryFn: api.pairlistAvailable,
    retry: 1,
  })

  const { data: showConfig } = useQuery({
    queryKey: ['showConfig'],
    queryFn: api.showConfig,
    retry: 1,
  })

  const evaluateMutation = useMutation({
    mutationFn: (pairlists: unknown[]) =>
      api.pairlistEvaluate(pairlists, showConfig?.stake_currency ?? 'USDT', []),
    onSuccess: (data) => {
      setEvaluating(true)
      setJobResult(null)
      pollJob(data.job_id)
    },
  })

  const pollJob = (jobId: string) => {
    if (pollTimer.current) clearInterval(pollTimer.current)
    const startedAt = Date.now()
    const MAX_POLL_MS = 180000
    const check = async () => {
      if (Date.now() - startedAt > MAX_POLL_MS) {
        if (pollTimer.current) clearInterval(pollTimer.current)
        setEvaluating(false)
        setJobResult({ status: 'failed', error: '评估超时' })
        return
      }
      try {
        const result = await api.pairlistEvaluateResult(jobId)
        if (result.status === 'success') {
          if (pollTimer.current) clearInterval(pollTimer.current)
          setEvaluating(false)
          setJobResult({
            status: 'success',
            whitelist: result.result?.whitelist ?? [],
            method: result.result?.method ?? [],
          })
        } else if (result.status === 'failed' || result.error) {
          if (pollTimer.current) clearInterval(pollTimer.current)
          setEvaluating(false)
          setJobResult({ status: 'failed', error: result.error ?? '评估失败' })
        }
        // 400 (still running) — keep polling
      } catch (e) {
        // 404/400 while running: keep polling until timeout
        const err = e as Error
        if (err.message.includes('400') || err.message.includes('404')) return
        if (pollTimer.current) clearInterval(pollTimer.current)
        setEvaluating(false)
        setJobResult({ status: 'failed', error: err.message })
      }
    }
    check()
    pollTimer.current = setInterval(check, 1500)
  }

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [])

  const pairlistDefs = (available?.pairlists ?? []).map((p) => ({
    name: p.name,
    isGenerator: p.is_pairlist_generator,
    description: p.description,
    defaults: (p.params ?? {}) as Record<string, unknown>,
  }))

  const togglePairlist = (name: string) => {
    setSelectedPairlists((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const movePairlist = (name: string, direction: 'up' | 'down') => {
    setSelectedPairlists((prev) => {
      const idx = prev.indexOf(name)
      if (idx === -1) return prev
      const next = [...prev]
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= next.length) return prev
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }

  const handleEvaluate = () => {
    const defs = pairlistDefs.filter((d) => selectedPairlists.includes(d.name))
    const payload = defs.map((d) => ({ method: d.name, ...d.defaults }))
    evaluateMutation.mutate(payload)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">交易对列表管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">配置和评估 Pairlist 过滤器链</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetchAvailable()}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            onClick={handleEvaluate}
            disabled={evaluating || evaluateMutation.isPending || selectedPairlists.length === 0}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {evaluating || evaluateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {evaluating ? '评估中...' : '评估'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Available Pairlists */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            可用过滤器 {loadingAvailable && <Loader2 className="w-3 h-3 animate-spin" />}
          </h3>
          <p className="text-xs text-muted-foreground">
            选择并排序需要的过滤器，然后点击"评估"生成交易对白名单
          </p>

          {pairlistDefs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">无可用过滤器</p>
          ) : (
            <div className="space-y-1.5">
              {pairlistDefs.map((pl) => {
                const selected = selectedPairlists.includes(pl.name)
                return (
                  <div
                    key={pl.name}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md border transition-colors cursor-pointer",
                      selected ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border hover:border-primary/20"
                    )}
                    onClick={() => togglePairlist(pl.name)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                        selected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      )}>
                        {selected && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{pl.name}</span>
                        {pl.isGenerator && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            <Layers className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
                            生成器
                          </span>
                        )}
                        {pl.description && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-64">{pl.description}</p>
                        )}
                      </div>
                    </div>
                    {selected && (
                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => movePairlist(pl.name, 'up')} className="text-xs text-muted-foreground hover:text-foreground px-1">▲</button>
                        <button onClick={() => movePairlist(pl.name, 'down')} className="text-xs text-muted-foreground hover:text-foreground px-1">▼</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Active Pairlist Chain */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow space-y-4">
          <h3 className="text-sm font-semibold">当前链 ({selectedPairlists.length})</h3>
          {selectedPairlists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">从左侧选择过滤器</p>
          ) : (
            <div className="space-y-2">
              {selectedPairlists.map((name, idx) => (
                <div key={name} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-secondary/30 border border-border">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">{name}</span>
                  <button
                    onClick={() => togglePairlist(name)}
                    disabled={evaluating}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    移除
                  </button>
                  {idx < selectedPairlists.length - 1 && (
                    <span className="text-muted-foreground text-xs">↓</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Evaluation Result */}
          {evaluating && (
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                正在评估交易对列表...
              </p>
            </div>
          )}
          {jobResult?.status === 'success' && (
            <div className="p-3 rounded-md bg-success/10 border border-success/20 space-y-2">
              <p className="text-xs font-medium text-success flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                评估完成 · {jobResult.whitelist?.length ?? 0} 个交易对
              </p>
              {jobResult.method && jobResult.method.length > 0 && (
                <p className="text-[10px] text-muted-foreground">方法: {jobResult.method.join(' → ')}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(jobResult.whitelist ?? []).map((pair) => (
                  <span key={pair} className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary border border-border">
                    {pair}
                  </span>
                ))}
              </div>
            </div>
          )}
          {jobResult?.status === 'failed' && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                评估失败: {jobResult.error}
              </p>
            </div>
          )}
          {evaluateMutation.isError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                评估失败: {(evaluateMutation.error as Error).message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
