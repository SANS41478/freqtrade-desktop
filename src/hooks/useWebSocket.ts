import { useEffect, useCallback, useState } from 'react'
import { wsClient } from '@/lib/websocket'
import type { RPCMessageType, WSMessage, OpenTradeSchema } from '@/types/freqtrade'

interface UseWebSocketOptions {
  autoConnect?: boolean
  subscriptions?: RPCMessageType[]
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, subscriptions = [] } = options
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)

  useEffect(() => {
    if (autoConnect) {
      wsClient.connect()
      const unsub = wsClient.onAny((msg) => {
        setLastMessage(msg)
        setConnected(true)
      })

      return () => {
        unsub()
      }
    }
  }, [autoConnect])

  useEffect(() => {
    if (subscriptions.length > 0 && connected) {
      wsClient.subscribe(subscriptions)
    }
  }, [subscriptions, connected])

  const subscribe = useCallback((types: RPCMessageType[]) => {
    wsClient.subscribe(types)
  }, [])

  const onMessage = useCallback(
    (type: RPCMessageType, handler: (data: unknown) => void) => {
      return wsClient.on(type, (msg) => handler(msg.data))
    },
    [],
  )

  return { connected, lastMessage, subscribe, onMessage }
}

// ============================================================
// Dedicated hook for live trade updates via WebSocket
// ============================================================

export function useLiveTrades() {
  const [trades, setTrades] = useState<Map<number, OpenTradeSchema>>(new Map())

  useEffect(() => {
    wsClient.connect()
    wsClient.subscribe(['entry', 'exit', 'entry_fill', 'exit_fill'])

    const unsubs = [
      wsClient.on('entry', (msg) => {
        const trade = msg.data as OpenTradeSchema
        setTrades((prev) => {
          const next = new Map(prev)
          next.set(trade.trade_id, trade)
          return next
        })
      }),
      wsClient.on('exit', (msg) => {
        const trade = msg.data as OpenTradeSchema
        setTrades((prev) => {
          const next = new Map(prev)
          next.delete(trade.trade_id)
          return next
        })
      }),
      wsClient.on('entry_fill', (msg) => {
        const trade = msg.data as OpenTradeSchema
        setTrades((prev) => {
          const next = new Map(prev)
          next.set(trade.trade_id, trade)
          return next
        })
      }),
      wsClient.on('exit_fill', (msg) => {
        const trade = msg.data as OpenTradeSchema
        setTrades((prev) => {
          const next = new Map(prev)
          next.set(trade.trade_id, trade)
          return next
        })
      }),
    ]

    return () => unsubs.forEach((u) => u())
  }, [])

  return trades
}
