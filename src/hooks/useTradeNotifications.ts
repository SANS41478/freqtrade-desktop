import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import type { WSMessage } from '@/types/freqtrade'

/**
 * Listens for trade events via WebSocket and forwards them
 * to the Electron main process for native desktop notifications.
 * Falls back to in-app toasts when not in Electron.
 */
export function useTradeNotifications() {
  useEffect(() => {
    wsClient.connect()

    const handleTradeEvent = (msg: WSMessage) => {
      const data = msg.data as Record<string, unknown> | undefined
      if (!data) return

      const pair = data.pair as string | undefined
      const tradeId = data.trade_id as number | undefined
      const isShort = data.is_short as boolean | undefined

      let notification: {
        type: 'entry' | 'exit' | 'stop_loss' | 'warning'
        pair: string
        profit?: number
        profitPct?: number
        tradeId?: number
        message?: string
      } | null = null

      switch (msg.type) {
        case 'entry':
          notification = {
            type: 'entry',
            pair: pair ?? 'Unknown',
            tradeId,
            message: isShort ? 'short' : 'long',
          }
          break
        case 'exit':
          notification = {
            type: 'exit',
            pair: pair ?? 'Unknown',
            profit: data.close_profit_abs as number | undefined,
            profitPct: data.close_profit_pct as number | undefined,
            tradeId,
          }
          break
        case 'exit_cancel':
          notification = {
            type: 'exit',
            pair: pair ?? 'Unknown',
            tradeId,
            profit: data.close_profit_abs as number | undefined,
            profitPct: data.close_profit_pct as number | undefined,
            message: '挂单已取消',
          }
          break
        case 'protection_trigger':
          notification = {
            type: 'warning',
            pair: pair ?? 'Global',
            message: (data.reason as string) ?? '风控已触发',
          }
          break
      }

      if (notification) {
        // Electron native notification
        if (window.electronAPI) {
          window.electronAPI.notifyTrade(notification)
        }
        // Browser fallback: log to console
        if (!window.electronAPI && import.meta.env.DEV) {
          console.log('[Notification]', notification.type, notification.pair, notification)
        }
      }
    }

    const unsubEntry = wsClient.on('entry', handleTradeEvent)
    const unsubExit = wsClient.on('exit', handleTradeEvent)
    const unsubExitCancel = wsClient.on('exit_cancel', handleTradeEvent)
    const unsubProtection = wsClient.on('protection_trigger', handleTradeEvent)

    // Subscribe
    wsClient.subscribe(['entry', 'exit', 'exit_cancel', 'protection_trigger'])

    return () => {
      unsubEntry()
      unsubExit()
      unsubExitCancel()
      unsubProtection()
    }
  }, [])
}
