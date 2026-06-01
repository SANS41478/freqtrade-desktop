import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Plus, TrendingUp, Clock, Code2, Pencil } from 'lucide-react'
import { StrategyEditor, PYTHON_TEMPLATE } from '@/components/editor/StrategyEditor'
import type { StrategyResponse } from '@/types/freqtrade'

export function StrategyPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [editingCode, setEditingCode] = useState<{ name: string; code: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: strategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: api.strategies,
  })

  const { data: strategyDetail } = useQuery({
    queryKey: ['strategy', selected],
    queryFn: () => api.strategy(selected!),
    enabled: !!selected,
  })

  const strategyList = strategies?.strategies ?? []

  const handleOpenEditor = (name: string, code?: string) => {
    setEditingCode({ name, code: code ?? '' })
  }

  const handleEditorClose = () => {
    setEditingCode(null)
    // Refresh strategy detail if one was selected
    if (selected) {
      queryClient.invalidateQueries({ queryKey: ['strategy', selected] })
    }
    // Also refresh the strategies list (new strategy may have been created)
    queryClient.invalidateQueries({ queryKey: ['strategies'] })
  }

  const handleSaved = (_name: string, _code: string) => {
    queryClient.invalidateQueries({ queryKey: ['strategy', selected] })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">策略管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">管理和编辑交易策略</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEditor('NewStrategy', '')}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-[#21262d] hover:bg-[#1c2128] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建策略
          </button>
          <button
            onClick={() => handleOpenEditor('NewStrategy', PYTHON_TEMPLATE.replace(/\{name\}/g, 'NewStrategy'))}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors"
          >
            从模板创建
          </button>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-3 gap-4">
        {strategyList.length === 0 && (
          <div className="col-span-3 py-12 text-center text-muted-foreground">
            <Code2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无策略文件</p>
            <p className="text-xs mt-1">点击"新建策略"创建你的第一个策略</p>
          </div>
        )}
        {strategyList.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name === selected ? null : name)}
            className={cn(
              'text-left bg-card border rounded-lg p-4 card-glow transition-colors cursor-pointer group',
              name === selected ? 'border-primary/50' : 'border-border hover:border-primary/30',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center',
                name === selected ? 'bg-primary/10' : 'bg-secondary',
              )}>
                <Code2 className={cn('w-4 h-4', name === selected ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  name === selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  {name === selected ? '已选中' : '可用'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Load code from API if available
                    api.strategy(name).then((res) => {
                      handleOpenEditor(name, res.code)
                    }).catch(() => {
                      handleOpenEditor(name, '')
                    })
                  }}
                  className="p-1 rounded hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="编辑代码"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold font-mono">{name}</h3>
            <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />5m</span>
              <span>Spot</span>
            </div>
          </button>
        ))}
      </div>

      {/* Strategy Detail */}
      {selected && strategyDetail && (
        <StrategyDetailPanel
          detail={strategyDetail}
          onEditCode={() => handleOpenEditor(strategyDetail.strategy, strategyDetail.code)}
        />
      )}

      {/* Monaco Editor Modal */}
      {editingCode && (
        <StrategyEditor
          strategyName={editingCode.name}
          initialCode={editingCode.code}
          onClose={handleEditorClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function StrategyDetailPanel({ detail, onEditCode }: { detail: StrategyResponse; onEditCode: () => void }) {
  return (
    <div className="bg-card border border-primary/30 rounded-lg p-5 card-glow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{detail.strategy}</h3>
          <p className="text-xs text-muted-foreground">
            Python · {detail.timeframe ?? '5m'}
          </p>
        </div>
        <button
          onClick={onEditCode}
          className="ml-auto px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Pencil className="w-3.5 h-3.5" />
          编辑代码
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <InfoBlock label="时间框架" value={detail.timeframe ?? '5m'} />
        <InfoBlock label="参数数量" value={String(detail.params.length)} />
        <InfoBlock label="可优化参数" value={String(detail.params.filter((p) => p.optimize).length)} />
      </div>

      <p className="text-xs font-medium text-muted-foreground mb-2">策略参数</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left py-2 font-medium">参数名</th>
            <th className="text-left py-2 font-medium">类型</th>
            <th className="text-left py-2 font-medium">空间</th>
            <th className="text-right py-2 font-medium">当前值</th>
            <th className="text-right py-2 font-medium">最小值</th>
            <th className="text-right py-2 font-medium">最大值</th>
          </tr>
        </thead>
        <tbody>
          {detail.params.map((param) => (
            <tr key={param.name} className="border-b border-border/50 hover:bg-secondary/30">
              <td className="py-2 font-medium font-mono text-xs">{param.name}</td>
              <td className="py-2 text-muted-foreground text-xs">{param.param_type}</td>
              <td className="py-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{param.space}</span>
              </td>
              <td className="py-2 text-right font-mono text-xs">{String(param.value)}</td>
              <td className="py-2 text-right text-muted-foreground font-mono text-xs">
                {param.low ?? '-'}
              </td>
              <td className="py-2 text-right text-muted-foreground font-mono text-xs">
                {param.high ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-secondary/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
