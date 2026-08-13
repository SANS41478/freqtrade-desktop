import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function ForceEntryForm() {
  const [pair, setPair] = useState('')
  const [side, setSide] = useState<'long' | 'short'>('long')
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market')
  const [price, setPrice] = useState('')
  const [stakeAmount, setStakeAmount] = useState('')
  const [entryTag, setEntryTag] = useState('')
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const queryClient = useQueryClient()

  const { data: whitelist } = useQuery({
    queryKey: ['whitelist'],
    queryFn: api.whitelist,
  })

  const { data: config } = useQuery({
    queryKey: ['showConfig'],
    queryFn: api.showConfig,
  })

  const forceEntryEnabled = config?.force_entry_enable ?? false
  const pairs = whitelist?.whitelist ?? []

  const forceEnterMutation = useMutation({
    mutationFn: api.forceEnter,
    onSuccess: (data) => {
      const msg = 'status' in data ? data.status : `已创建入场订单 #${data.trade_id}`
      setResult({ type: 'success', message: `入场成功: ${msg}` })
      queryClient.invalidateQueries({ queryKey: ['status'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      setTimeout(() => setResult(null), 5000)
    },
    onError: (error) => {
      setResult({ type: 'error', message: `入场失败: ${error.message}` })
    },
  })

  if (!forceEntryEnabled) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#8b949e]" />
          强制入场
        </h3>
        <p className="text-xs text-[#8b949e]">
          强制入场未启用。请在配置中将 <code className="text-[#f97316] font-mono">force_entry_enable</code> 设为 true。
        </p>
      </div>
    )
  }

  const handleSubmit = () => {
    if (!pair.trim()) {
      setResult({ type: 'error', message: '请输入交易对' })
      return
    }
    setResult(null)
    forceEnterMutation.mutate({
      pair: pair.trim().toUpperCase(),
      side,
      ordertype: orderType,
      ...(price && orderType === 'limit' ? { price: Number(price) } : {}),
      ...(stakeAmount ? { stakeamount: Number(stakeAmount) } : {}),
      ...(entryTag.trim() ? { entry_tag: entryTag.trim() } : {}),
    })
  }

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-[#f97316]" />
        强制入场
      </h3>

      <div className="space-y-3">
        {/* Pair */}
        <div>
          <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">交易对</label>
          {pairs.length > 0 ? (
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono"
            >
              <option value="">选择交易对...</option>
              {pairs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={pair}
              onChange={(e) => setPair(e.target.value.toUpperCase())}
              placeholder="BTC/USDT"
              className="w-full mt-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
            />
          )}
        </div>

        {/* Side + OrderType */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">方向</label>
            <div className="flex mt-1">
              <button
                onClick={() => setSide('long')}
                className={`flex-1 py-1.5 text-xs rounded-l-md border transition-colors ${
                  side === 'long'
                    ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/30'
                    : 'bg-[#0d1117] border-[#21262d] text-[#8b949e]'
                }`}
              >
                多头
              </button>
              <button
                onClick={() => setSide('short')}
                className={`flex-1 py-1.5 text-xs rounded-r-md border border-l-0 transition-colors ${
                  side === 'short'
                    ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30'
                    : 'bg-[#0d1117] border-[#21262d] text-[#8b949e]'
                }`}
              >
                空头
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">订单类型</label>
            <div className="flex mt-1">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-1.5 text-xs rounded-l-md border transition-colors ${
                  orderType === 'market'
                    ? 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30'
                    : 'bg-[#0d1117] border-[#21262d] text-[#8b949e]'
                }`}
              >
                市价
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-1.5 text-xs rounded-r-md border border-l-0 transition-colors ${
                  orderType === 'limit'
                    ? 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30'
                    : 'bg-[#0d1117] border-[#21262d] text-[#8b949e]'
                }`}
              >
                限价
              </button>
            </div>
          </div>
        </div>

        {/* Price (only for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">限价 (可选)</label>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="留空使用市价"
              className="w-full mt-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
            />
          </div>
        )}

        {/* Stake + Entry Tag */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">投入金额 (可选)</label>
            <input
              type="number"
              step="any"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="默认"
              className="w-full mt-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">入场标签 (可选)</label>
            <input
              type="text"
              value={entryTag}
              onChange={(e) => setEntryTag(e.target.value)}
              placeholder="手动入场"
              className="w-full mt-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
            />
          </div>
        </div>

        {/* Result message */}
        {result && (
          <div className={`flex items-center gap-2 text-xs p-2 rounded ${
            result.type === 'success' ? 'bg-[#3fb950]/10 text-[#3fb950]' : 'bg-[#f85149]/10 text-[#f85149]'
          }`}>
            {result.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {result.message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={forceEnterMutation.isPending}
          className="w-full py-2 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {forceEnterMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              提交中...
            </>
          ) : (
            '执行入场'
          )}
        </button>
      </div>
    </div>
  )
}
