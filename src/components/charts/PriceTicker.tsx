import { useState, useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { cn, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react'

interface PairPrice {
  pair: string
  price: number
  change: number  // relative to previous price
  prevPrice: number
}

export function PriceTicker({ pairs }: { pairs: string[] }) {
  const [prices, setPrices] = useState<Map<string, PairPrice>>(new Map())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    wsClient.connect()
    wsClient.subscribe(['whitelist', 'new_candle'])

    const unsub1 = wsClient.on('whitelist', (msg) => {
      const data = msg.data as { whitelist?: string[] }
      if (data.whitelist) {
        // Update available pairs
      }
    })

    const unsub2 = wsClient.on('new_candle', (msg) => {
      const data = msg.data as Record<string, unknown>
      const pair = data.pair as string
      const close = data.close as number
      if (!pair || typeof close !== 'number') return

      setPrices((prev) => {
        const existing = prev.get(pair)
        const next = new Map(prev)
        next.set(pair, {
          pair,
          price: close,
          change: existing ? close - existing.price : 0,
          prevPrice: existing?.price ?? close,
        })
        return next
      })
    })

    // Check connection via WebSocket onConnection
    const unsub = wsClient.onConnection((isConnected: boolean) => {
      setConnected(isConnected)
    })

    return () => {
      unsub1()
      unsub2()
      unsub()
    }
  }, [])

  const tickerList = Array.from(prices.values()).filter((p) => pairs.includes(p.pair))
  if (tickerList.length === 0 && pairs.length > 0) {
    tickerList.push(...pairs.map((p) => ({ pair: p, price: 0, change: 0, prevPrice: 0 })))
  }

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-3 h-3 text-[#3fb950]" />
          ) : (
            <WifiOff className="w-3 h-3 text-[#f85149]" />
          )}
          <h3 className="text-sm font-semibold">实时行情</h3>
        </div>
        <span className="text-[10px] text-[#8b949e]">
          {connected ? 'WebSocket 已连接' : '等待连接...'}
        </span>
      </div>

      <div className="space-y-1">
        {tickerList.length === 0 ? (
          <p className="text-xs text-[#8b949e] text-center py-4">暂无价格数据</p>
        ) : (
          tickerList.map((item) => (
            <div
              key={item.pair}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-[#0d1117] hover:bg-[#1c2128] transition-colors"
            >
              <span className="text-sm font-medium font-mono">{item.pair}</span>
              <div className="flex items-center gap-3">
                {item.price > 0 ? (
                  <>
                    <span className="text-sm font-mono font-medium">
                      {formatCurrency(item.price)}
                    </span>
                    {item.change !== 0 && (
                      <span
                        className={cn(
                          'text-xs flex items-center gap-0.5 font-mono',
                          item.change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]',
                        )}
                      >
                        {item.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {item.change >= 0 ? '+' : ''}
                        {formatCurrency(item.change)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-[#8b949e]">等待数据...</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
