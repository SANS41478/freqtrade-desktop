import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ForceExitButtonProps {
  tradeId: number
  pair: string
}

export function ForceExitButton({ tradeId, pair }: ForceExitButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market')
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const queryClient = useQueryClient()

  const forceExitMutation = useMutation({
    mutationFn: () => api.forceExit(tradeId, orderType),
    onSuccess: (data) => {
      setResult({ type: 'success', message: `平仓成功: ${data.result}` })
      queryClient.invalidateQueries({ queryKey: ['status'] })
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      setTimeout(() => {
        setShowConfirm(false)
        setResult(null)
      }, 3000)
    },
    onError: (error) => {
      setResult({ type: 'error', message: `平仓失败: ${error.message}` })
    },
  })

  if (!showConfirm) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
        className="text-xs px-2 py-0.5 rounded border border-[#f85149]/30 text-[#f85149] hover:bg-[#f85149]/10 transition-colors"
      >
        强制平仓
      </button>
    )
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-2 bg-[#0d1117] border border-[#f85149]/30 rounded-md px-2 py-1"
    >
      <span className="text-xs text-[#f85149] font-mono">{pair}</span>
      <select
        value={orderType}
        onChange={(e) => setOrderType(e.target.value as 'limit' | 'market')}
        className="text-xs bg-[#161b22] border border-[#21262d] rounded px-1 py-0.5 text-[#e6edf3]"
      >
        <option value="market">市价</option>
        <option value="limit">限价</option>
      </select>
      {result ? (
        <span className={`text-xs flex items-center gap-1 ${result.type === 'success' ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
          {result.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {result.message}
        </span>
      ) : (
        <>
          <button
            onClick={() => forceExitMutation.mutate()}
            disabled={forceExitMutation.isPending}
            className="text-xs px-1.5 py-0.5 rounded bg-[#f85149] text-white hover:bg-[#f85149]/80 disabled:opacity-50 flex items-center gap-1"
          >
            {forceExitMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <X className="w-3 h-3" />
            )}
            确认
          </button>
          <button
            onClick={() => { setShowConfirm(false); setResult(null) }}
            className="text-xs text-[#8b949e] hover:text-[#e6edf3]"
          >
            取消
          </button>
        </>
      )}
    </div>
  )
}
