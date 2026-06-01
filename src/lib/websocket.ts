import type { RPCMessageType, WSMessage } from '@/types/freqtrade'

type MessageHandler = (msg: WSMessage) => void
type ConnectionHandler = (connected: boolean) => void

import { apiAuth } from '@/lib/auth-config'

const WS_URL = apiAuth.wsUrl
const WS_TOKEN = apiAuth.wsToken
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000
const RECONNECT_BACKOFF = 1.5

class FreqtradeWebSocket {
  private ws: WebSocket | null = null
  private handlers = new Map<RPCMessageType, Set<MessageHandler>>()
  private allHandlers = new Set<MessageHandler>()
  private connectionHandlers = new Set<ConnectionHandler>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private subscribed: RPCMessageType[] = []
  private reconnectAttempts = 0
  private currentDelay = INITIAL_RECONNECT_DELAY
  private intentionalClose = false

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    if (this.ws?.readyState === WebSocket.CONNECTING) return

    this.intentionalClose = false
    const url = `${WS_URL}?token=${encodeURIComponent(WS_TOKEN)}`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('[WS] Connected')
      this.reconnectAttempts = 0
      this.currentDelay = INITIAL_RECONNECT_DELAY
      this.notifyConnection(true)
      // Re-subscribe after reconnect
      if (this.subscribed.length > 0) {
        this.send({ type: 'subscribe', data: this.subscribed })
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        this.dispatch(msg)
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    this.ws.onclose = () => {
      this.notifyConnection(false)
      if (this.intentionalClose) return

      this.reconnectAttempts++
      const delay = Math.min(
        this.currentDelay * Math.pow(RECONNECT_BACKOFF, this.reconnectAttempts - 1),
        MAX_RECONNECT_DELAY,
      )
      console.log(`[WS] Disconnected, reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`)
      this.reconnectTimer = setTimeout(() => this.connect(), delay)
    }

    this.ws.onerror = () => {
      // onclose will fire after this, triggering reconnect
    }
  }

  disconnect() {
    this.intentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.notifyConnection(false)
  }

  subscribe(types: RPCMessageType[]) {
    this.subscribed = [...new Set([...this.subscribed, ...types])]
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', data: this.subscribed })
    }
  }

  on(type: RPCMessageType, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)?.delete(handler)
  }

  onAny(handler: MessageHandler) {
    this.allHandlers.add(handler)
    return () => this.allHandlers.delete(handler)
  }

  onConnection(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler)
    return () => this.connectionHandlers.delete(handler)
  }

  private dispatch(msg: WSMessage) {
    this.allHandlers.forEach((h) => h(msg))
    this.handlers.get(msg.type)?.forEach((h) => h(msg))
  }

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((h) => h(connected))
  }

  private send(data: unknown) {
    this.ws?.send(JSON.stringify(data))
  }
}

export const wsClient = new FreqtradeWebSocket()
