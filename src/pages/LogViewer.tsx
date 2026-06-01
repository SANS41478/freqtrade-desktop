import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { FileText, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

type LogEntry = [string, number, string, string, string]  // [time, ts, module, level, message]

export function LogViewer() {
  const [filter, setFilter] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [liveLines, setLiveLines] = useState<string[]>([])
  const [paused, setPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [levelFilter, setLevelFilter] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['logs'],
    queryFn: api.logs,
    refetchInterval: false,
  })

  // Live tail via Electron IPC
  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.onStdout((msg: string) => {
      if (!paused) setLiveLines((prev) => [...prev.slice(-2000), msg.trimEnd()])
    })
    window.electronAPI.onStderr((msg: string) => {
      if (!paused) setLiveLines((prev) => [...prev.slice(-2000), `[STDERR] ${msg.trimEnd()}`])
    })
  }, [paused])

  // Parse structured log entries into display lines
  const parsedLines = useMemo(() => {
    const entries = data?.logs ?? []
    const lines = entries.map((entry) => ({
      time: entry[0],
      level: entry[3],
      module: entry[2],
      message: entry[4],
    }))
    return lines
  }, [data])

  const displayLines = useMemo(() => {
    let result = parsedLines

    if (levelFilter) {
      result = result.filter((l) => l.level === levelFilter)
    }
    if (filter.trim()) {
      const lower = filter.toLowerCase()
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(lower) ||
          l.module.toLowerCase().includes(lower),
      )
    }
    return result
  }, [parsedLines, filter, levelFilter])

  // Add live lines
  const allDisplayLines = useMemo(() => {
    const live = liveLines.map((msg) => ({
      time: '',
      level: 'LIVE',
      module: '',
      message: msg,
    }))
    return [...displayLines, ...live]
  }, [displayLines, liveLines])

  // Count by level
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    parsedLines.forEach((l) => {
      counts[l.level] = (counts[l.level] || 0) + 1
    })
    return counts
  }, [parsedLines])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [allDisplayLines, autoScroll])

  const handleCopy = useCallback(async () => {
    const text = allDisplayLines
      .map((l) => `${l.time} [${l.level}] ${l.module}: ${l.message}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [allDisplayLines])

  const levels = ['', 'DEBUG', 'INFO', 'WARNING', 'ERROR']
  const levelColors: Record<string, string> = {
    ERROR: 'text-[#f85149]',
    WARNING: 'text-[#d2991d]',
    INFO: 'text-[#e6edf3]',
    DEBUG: 'text-[#8b949e]',
    LIVE: 'text-[#3fb950]',
  }

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">日志查看器</h2>
          <p className="text-sm text-[#8b949e] mt-0.5">
            {parsedLines.length > 0
              ? `${parsedLines.length} 条日志`
              : '实时查看 Freqtrade 运行日志'}
            {(levelCounts.ERROR ?? 0) > 0 && (
              <span className="ml-2 text-[#f85149]">{levelCounts.ERROR} 个错误</span>
            )}
            {liveLines.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-[#3fb950]/10 text-[#3fb950]">
                ● LIVE
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              paused
                ? 'bg-[#d2991d]/10 text-[#d2991d] border-[#d2991d]/30'
                : 'border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
            }`}
          >
            {paused ? '已暂停' : '实时'}
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              autoScroll
                ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/30'
                : 'border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
            }`}
          >
            自动滚动
          </button>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128] transition-colors flex items-center gap-1.5"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={() => { setLiveLines([]); refetch() }}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128] transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            刷新
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索日志内容..."
          className="flex-1 px-3 py-1.5 rounded-md text-sm bg-[#161b22] border border-[#21262d] text-[#e6edf3] placeholder-[#8b949e] font-mono"
        />
        <div className="flex gap-0.5">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(levelFilter === lvl ? '' : lvl)}
              className={`px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
                levelFilter === lvl
                  ? 'bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/20'
                  : lvl === ''
                    ? 'bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
                    : 'bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:bg-[#1c2128]'
              }`}
            >
              {lvl || '全部'}
              {lvl && levelCounts[lvl] ? ` (${levelCounts[lvl]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Log content */}
      <div className="flex-1 bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden min-h-0">
        {isLoading ? (
          <div className="space-y-2 p-4 animate-pulse">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-[#161b22] rounded"
                style={{ width: `${40 + Math.random() * 55}%` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-[#f85149] mx-auto mb-2" />
              <p className="text-sm text-[#f85149]">{(error as Error).message}</p>
              <button onClick={() => refetch()} className="mt-2 text-xs text-[#8b949e] hover:underline">
                重试
              </button>
            </div>
          </div>
        ) : allDisplayLines.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-[#8b949e]">暂无日志</p>
              <p className="text-xs text-[#8b949e] mt-1">Freqtrade 运行后将在此显示日志</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="h-full overflow-y-auto">
            <div className="font-mono text-xs leading-relaxed">
              {allDisplayLines.map((line, i) => (
                <div
                  key={i}
                  className={`px-4 py-0.5 hover:bg-[#1c2128]/50 flex gap-3 ${levelColors[line.level] || 'text-[#e6edf3]'}`}
                >
                  <span className="text-[#8b949e] flex-shrink-0 w-[130px]">{line.time}</span>
                  <span className={`flex-shrink-0 w-[60px] font-medium ${
                    line.level === 'ERROR' ? 'text-[#f85149]' :
                    line.level === 'WARNING' ? 'text-[#d2991d]' :
                    line.level === 'LIVE' ? 'text-[#3fb950]' :
                    'text-[#8b949e]'
                  }`}>
                    {line.level}
                  </span>
                  <span className="text-[#8b949e] flex-shrink-0 w-[120px] truncate">{line.module}</span>
                  <span className="flex-1">{line.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
