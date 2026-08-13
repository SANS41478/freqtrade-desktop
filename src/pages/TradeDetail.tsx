import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatPercent, formatDuration } from '@/lib/utils'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Target, Trash2, X, RefreshCw, Loader2 } from 'lucide-react'
import type { OpenTradeSchema } from '@/types/freqtrade'

interface TradeDetailProps {
  tradeId: number
  onBack: () => void
}

export function TradeDetail({ tradeId, onBack }: TradeDetailProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteTrade(tradeId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trades'] }); onBack() },
  })
  const cancelOrderMutation = useMutation({
    mutationFn: () => api.cancelOpenOrder(tradeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade', tradeId] }),
  })
  const reloadMutation = useMutation({
    mutationFn: () => api.reloadTrade(tradeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trade', tradeId] }),
  })

  const { data: trade, isLoading, error } = useQuery({
    queryKey: ['trade', tradeId],
    queryFn: () => api.trade(tradeId),
  })

  const { data: customData } = useQuery({
    queryKey: ['customData', tradeId],
    queryFn: () => api.tradeCustomData(tradeId),
    enabled: trade?.is_open === true,
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> 返回交易列表
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-secondary rounded" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-secondary rounded-lg" />
            ))}
          </div>
          <div className="h-48 bg-secondary rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> 返回交易列表
        </button>
        <div className="text-center py-12">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-muted-foreground">
            {error ? `加载失败: ${(error as Error).message}` : `交易 #${tradeId} 未找到`}
          </p>
        </div>
      </div>
    )
  }

  const isWin = (trade.close_profit_abs ?? 0) >= 0
  const isOpen = trade.is_open
  const duration = trade.open_timestamp && trade.close_timestamp
    ? formatDuration(Math.round((trade.close_timestamp - trade.open_timestamp) / 60000))
    : trade.open_timestamp
      ? formatDuration(Math.round((Date.now() - trade.open_timestamp) / 60000))
      : '-'
  const orders = trade.orders

  return (
    <div className="p-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> 返回交易列表
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isOpen ? 'bg-warning/10' : isWin ? 'bg-success/10' : 'bg-destructive/10',
        )}>
          {isOpen ? (
            <Clock className="w-5 h-5 text-warning" />
          ) : isWin ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold font-mono">{trade.pair}</h2>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              trade.is_short ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
            )}>
              {trade.is_short ? '空头' : '多头'}
            </span>
            {isOpen && (
              <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">持仓中</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            #{trade.trade_id} · {trade.strategy} · {trade.timeframe}
            {trade.enter_tag ? ` · 标签: ${trade.enter_tag}` : ''}
          </p>
        </div>
        {!isOpen && (
          <div className="ml-auto text-right">
            <p className={cn('text-2xl font-bold font-mono', isWin ? 'metric-up' : 'metric-down')}>
              {formatCurrency(trade.close_profit_abs ?? 0)}
            </p>
            <p className={cn('text-sm', isWin ? 'metric-up' : 'metric-down')}>
              {formatPercent(trade.close_profit_pct ?? 0)}
            </p>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          {trade.has_open_orders && (
            <button
              onClick={() => { if (confirm('确定取消未成交订单？')) cancelOrderMutation.mutate() }}
              disabled={cancelOrderMutation.isPending}
              className="px-2 py-1 rounded text-xs border border-warning/30 text-warning hover:bg-warning/10 disabled:opacity-50 flex items-center gap-1"
            >
              {cancelOrderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              取消挂单
            </button>
          )}
          <button
            onClick={() => { if (confirm('确定从交易所重载此交易？')) reloadMutation.mutate() }}
            disabled={reloadMutation.isPending}
            className="px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 flex items-center gap-1"
          >
            {reloadMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            重载
          </button>
          <button
            onClick={() => { if (confirm(`确定删除交易 #${tradeId}？此操作不可恢复。`)) deleteMutation.mutate() }}
            disabled={deleteMutation.isPending}
            className="px-2 py-1 rounded text-xs border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-50 flex items-center gap-1"
          >
            {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            删除
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-6 gap-3">
        <MetricCard label="入场价" value={formatCurrency(trade.open_rate)} />
        <MetricCard label="出场价" value={trade.close_rate ? formatCurrency(trade.close_rate) : '持仓中'} />
        <MetricCard label="数量" value={trade.amount?.toFixed(4) ?? '-'} />
        <MetricCard label="投入" value={formatCurrency(trade.stake_amount ?? 0)} />
        <MetricCard label="持仓时长" value={duration} />
        <MetricCard label="杠杆" value={`${trade.leverage ?? 1}x`} />
        <MetricCard label="入场费" value={`${formatCurrency(trade.fee_open_cost ?? 0)} (${formatPercent(trade.fee_open ?? 0, 1)})`} />
        <MetricCard label="出场费" value={`${formatCurrency(trade.fee_close_cost ?? 0)} (${formatPercent(trade.fee_close ?? 0, 1)})`} />
        <MetricCard label="资金费率" value={formatCurrency((trade as OpenTradeSchema & { funding_fees?: number }).funding_fees ?? 0)} />
        <MetricCard label="最小价" value={trade.min_rate ? formatCurrency(trade.min_rate) : '-'} />
        <MetricCard label="最大价" value={trade.max_rate ? formatCurrency(trade.max_rate) : '-'} />
        <MetricCard label="出场原因" value={trade.exit_reason ?? (isOpen ? '-' : '未知')} />
      </div>

      {/* Stop Loss Section */}
      <div className="bg-card border border-border rounded-lg p-4 card-glow">
        <h3 className="text-sm font-semibold mb-3">止损信息</h3>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">初始止损</span>
            <p className="font-mono">{formatCurrency(trade.initial_stop_loss_abs ?? 0)}</p>
            <p className="text-xs metric-down">{formatPercent(trade.initial_stop_loss_ratio ?? 0)}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">当前止损</span>
            <p className="font-mono">{formatCurrency(trade.stop_loss_abs ?? 0)}</p>
            <p className="text-xs metric-down">{formatPercent(trade.stop_loss_ratio ?? 0)}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">止损距离</span>
            <p className="font-mono">
              {trade.stoploss_current_dist_ratio != null
                ? `${(trade.stoploss_current_dist_ratio * 100).toFixed(2)}%`
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">
              {trade.stoploss_current_dist != null
                ? formatCurrency(trade.stoploss_current_dist)
                : '-'}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">止损更新</span>
            <p className="font-mono text-xs">
              {trade.stoploss_last_update_timestamp
                ? new Date(trade.stoploss_last_update_timestamp * 1000).toLocaleString('zh-CN')
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {orders && orders.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 card-glow">
          <h3 className="text-sm font-semibold mb-3">订单明细 ({orders.length})</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-medium">订单ID</th>
                <th className="text-left py-2 font-medium">类型</th>
                <th className="text-left py-2 font-medium">状态</th>
                <th className="text-right py-2 font-medium">数量</th>
                <th className="text-right py-2 font-medium">价格</th>
                <th className="text-right py-2 font-medium">费用</th>
                <th className="text-right py-2 font-medium">时间</th>
                <th className="text-right py-2 font-medium">标签</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const side = order.ft_order_side
                const isBuy = side === 'buy'
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-1.5 text-xs font-mono text-muted-foreground">
                      {String(order.order_id ?? '-').slice(0, 10)}
                    </td>
                    <td className="py-1.5">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        isBuy ? 'bg-success/10 text-success' : side === 'stoploss' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive',
                      )}>
                        {isBuy ? '买入' : side === 'stoploss' ? '止损' : '卖出'}
                      </span>
                    </td>
                    <td className="py-1.5 text-xs">{order.status}</td>
                    <td className="py-1.5 text-xs font-mono text-right">{order.amount?.toFixed(4)}</td>
                    <td className="py-1.5 text-xs font-mono text-right">{formatCurrency(order.safe_price ?? 0)}</td>
                    <td className="py-1.5 text-xs font-mono text-right text-muted-foreground">
                      {order.ft_fee_base != null ? formatCurrency(order.ft_fee_base) : '-'}
                    </td>
                    <td className="py-1.5 text-xs text-right text-muted-foreground">
                      {order.order_filled_timestamp != null
                        ? new Date(order.order_filled_timestamp).toLocaleString('zh-CN')
                        : '-'}
                    </td>
                    <td className="py-1.5 text-xs text-right">
                      {order.ft_order_tag
                        ? <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{order.ft_order_tag}</span>
                        : <span className="text-muted-foreground">-</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Data */}
      {customData && customData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 card-glow">
          <h3 className="text-sm font-semibold mb-3">
            自定义数据 ({customData.reduce((n, c) => n + c.custom_data.length, 0)})
          </h3>
          {customData.map((cd) => (
            <div key={cd.trade_id} className="grid grid-cols-2 gap-2">
              {cd.custom_data.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 px-3 py-2 rounded bg-secondary/30">
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.key}</span>
                  <span className="text-xs font-mono break-all text-right">
                    {typeof item.value === 'object' && item.value !== null
                      ? JSON.stringify(item.value)
                      : String(item.value ?? '')}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Market Info */}
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="bg-card border border-border rounded-lg p-3 card-glow">
          <span className="text-xs text-muted-foreground">交易所</span>
          <p className="font-medium">{trade.exchange ?? '-'}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-glow">
          <span className="text-xs text-muted-foreground">交易模式</span>
          <p className="font-medium">{trade.trading_mode ?? 'spot'}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-glow">
          <span className="text-xs text-muted-foreground">精度</span>
          <p className="font-medium">
            数量: {trade.amount_precision ?? '-'} / 价格: {trade.price_precision ?? '-'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 card-glow">
          <span className="text-xs text-muted-foreground">入场/出场次数</span>
          <p className="font-medium">
            {trade.nr_of_successful_entries ?? '-'} / {trade.nr_of_successful_exits ?? '-'}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 card-glow">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold font-mono">{value}</p>
    </div>
  )
}