import { Play, Square, Pause, RefreshCw } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface BotStatusBannerProps {
  isRunning: boolean
}

export function BotStatusBanner({ isRunning }: BotStatusBannerProps) {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: api.startBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] })
    },
  })
  const stopMutation = useMutation({ mutationFn: api.stopBot })
  const pauseMutation = useMutation({ mutationFn: api.stopBuy })
  const reloadMutation = useMutation({ mutationFn: api.reloadConfig })

  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 text-xs flex-1 ${
      isRunning
        ? 'bg-[#3fb950]/5'
        : 'bg-[#d2991d]/5'
    }`}>
      <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#3fb950] animate-pulse' : 'bg-[#d2991d]'}`} />
      <span className={isRunning ? 'text-[#3fb950]' : 'text-[#d2991d]'}>
        {isRunning ? '交易运行中' : '交易未启动'}
      </span>

      <div className="flex items-center gap-1 ml-auto">
        {isRunning ? (
          <>
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="px-2 py-0.5 rounded border border-[#d2991d]/30 text-[#d2991d] hover:bg-[#d2991d]/10 disabled:opacity-50 flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              暂停入场
            </button>
            <button
              onClick={() => reloadMutation.mutate()}
              disabled={reloadMutation.isPending}
              className="px-2 py-0.5 rounded border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128] disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${reloadMutation.isPending ? 'animate-spin' : ''}`} />
              重载配置
            </button>
            <button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              className="px-2 py-0.5 rounded border border-[#f85149]/30 text-[#f85149] hover:bg-[#f85149]/10 disabled:opacity-50 flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              停止
            </button>
          </>
        ) : (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="px-2 py-0.5 rounded border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/10 disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            启动交易
          </button>
        )}
      </div>
    </div>
  )
}
