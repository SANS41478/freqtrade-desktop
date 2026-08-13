import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { getConnectionConfig } from "@/lib/auth-config"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

interface ConnectionStatusProps {
  onNavigate?: (tab: string) => void
}

export function ConnectionStatus({ onNavigate }: ConnectionStatusProps) {
  const { data: health, isLoading, error, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 15000,
    retry: 2,
  })

  const { data: version } = useQuery({
    queryKey: ["version"],
    queryFn: api.version,
    refetchInterval: 60000,
    retry: 1,
  })

  const [hostLabel, setHostLabel] = useState("127.0.0.1:8080")

  useEffect(() => {
    let mounted = true
    getConnectionConfig().then((cfg) => {
      if (mounted) setHostLabel(`${cfg.host}:${cfg.port}`)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const connected = !error && !!health
  const [showTooltip, setShowTooltip] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    if (!onNavigate) return

    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd + number for tab switching
      if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault()
        const tabs = ["dashboard", "trades", "candles", "backtest", "hyperopt", "strategy", "config", "data", "management"]
        const idx = parseInt(e.key) - 1
        if (idx < tabs.length) onNavigate(tabs[idx])
      }
      // Ctrl/Cmd + L for logs
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault()
        onNavigate("logs")
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onNavigate])

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={() => refetch()}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-colors",
          connected
            ? "text-[#3fb950] hover:bg-[#3fb950]/10"
            : "text-[#8b949e] hover:bg-[#1c2128]",
        )}
      >
        {connected ? (
          <Wifi className="w-3 h-3" />
        ) : isLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="hidden lg:inline">
          {connected ? (version?.version ?? "connected") : "disconnected"}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#161b22] border border-[#21262d] rounded-lg text-xs whitespace-nowrap z-50 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              <span className="text-[#e6edf3]">{hostLabel}</span>
            </div>
            {health && (
              <div className="text-[#8b949e] text-[10px]">
                {health.bot_start && `启动时间: ${new Date(health.bot_start).toLocaleString("zh-CN")}`}
              </div>
            )}
            {version && (
              <div className="text-[#8b949e] text-[10px]">Freqtrade v{version.version}</div>
            )}
            {error && (
              <div className="text-[#f85149] text-[10px]">连接失败 - 请确认 Freqtrade 已启动</div>
            )}
          </div>
          {/* Keyboard shortcuts */}
          <div className="mt-2 pt-2 border-t border-[#21262d] text-[#8b949e] text-[10px] space-y-0.5">
            <p className="text-[10px] text-[#d2991d] font-medium mb-1">快捷键</p>
            <div className="flex justify-between gap-4"><span>Ctrl+1</span><span>仪表盘</span></div>
            <div className="flex justify-between gap-4"><span>Ctrl+2</span><span>交易记录</span></div>
            <div className="flex justify-between gap-4"><span>Ctrl+3</span><span>K线图表</span></div>
            <div className="flex justify-between gap-4"><span>Ctrl+4</span><span>回测中心</span></div>
            <div className="flex justify-between gap-4"><span>Ctrl+L</span><span>日志查看器</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
