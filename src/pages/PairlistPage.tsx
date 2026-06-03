import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { List, Play, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export function PairlistPage() {
  const [selectedPairlists, setSelectedPairlists] = useState<string[]>(['VolumePairList'])

  const { data: available, isLoading: loadingAvailable, refetch: refetchAvailable } = useQuery({
    queryKey: ['pairlistAvailable'],
    queryFn: api.pairlistAvailable,
  })

  const evaluateMutation = useMutation({
    mutationFn: api.pairlistEvaluate,
  })

  const pairlistDefs = (available?.pairlists ?? []).map((p) => ({
    ...p,
    config: getDefaultConfig(p.name),
  }))

  function getDefaultConfig(name: string): Record<string, unknown> {
    switch (name) {
      case 'VolumePairList': return { number_assets: 20, sort_key: 'quoteVolume' }
      case 'AgeFilter': return { min_days_listed: 10, max_days_listed: 0 }
      case 'OffsetFilter': return { offset: 0, number_assets: 0 }
      case 'PerformanceFilter': return { days: 7, trade_back_seconds: 0 }
      case 'PrecisionFilter': return { supported_pairs: [] }
      case 'PriceFilter': return { low_price_ratio: 0.001 }
      case 'RangeStabilityFilter': return { days: 10, low_abs_mean: 0.005 }
      case 'SpreadFilter': return { max_spread_ratio: 0.005 }
      case 'StaticPairList': return {}
      case 'ShuffleFilter': return {}
      case 'ProducerPairList': return {}
      default: return {}
    }
  }

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
            onClick={() => evaluateMutation.mutate(selectedPairlists)}
            disabled={evaluateMutation.isPending || selectedPairlists.length === 0}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {evaluateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            评估
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
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center",
                        selected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      )}>
                        {selected && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium">{pl.name}</span>
                      {!pl.available && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">不可用</span>
                      )}
                    </div>
                    {selected && (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
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
          {evaluateMutation.isSuccess && (
            <div className="p-3 rounded-md bg-success/10 border border-success/20">
              <p className="text-xs font-medium text-success flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                评估完成
              </p>
              <pre className="text-xs text-muted-foreground mt-2 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                {JSON.stringify(evaluateMutation.data, null, 2)}
              </pre>
            </div>
          )}
          {evaluateMutation.isError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                评估失败: {evaluateMutation.error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}