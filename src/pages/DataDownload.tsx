import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Download, Database, FileType, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface DataFile {
  name: string
  pair: string
  timeframe: string
  size: number
  ext: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DataDownload() {
  const [pairs, setPairs] = useState('BTC/USDT\nETH/USDT')
  const [timeframe, setTimeframe] = useState('5m')
  const [exchange, setExchange] = useState('binance')
  const [dateStart, setDateStart] = useState('2026-01-01')
  const [dateEnd, setDateEnd] = useState('2026-05-19')
  const [dataFiles, setDataFiles] = useState<DataFile[]>([])
  const [dataPath, setDataPath] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const downloadMutation = useMutation({
    mutationFn: api.downloadData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtestHistory'] })
      loadDataFiles()
    },
  })

  const { data: history } = useQuery({
    queryKey: ['backtestHistory'],
    queryFn: api.backtestHistory,
  })

  const recentHistory = (history ?? []).slice(0, 5)

  const loadDataFiles = async () => {
    try {
      setLoadError(null)
      if (window.electronAPI) {
        const result = await window.electronAPI.dataList()
        if (result.success && result.files) {
          setDataFiles(result.files)
          setDataPath(result.path ?? '')
        } else {
          setLoadError(result.error ?? '无法加载文件列表')
        }
      } else {
        setLoadError('文件浏览仅在桌面端可用')
      }
    } catch (e) {
      setLoadError((e as Error).message)
    }
  }

  useEffect(() => {
    loadDataFiles()
  }, [])

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除 ${filename}？`)) return
    setDeleting(filename)
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.dataDelete(filename)
        if (result.success) {
          setDataFiles((prev) => prev.filter((f) => f.name !== filename))
        }
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = () => {
    const pairList = pairs.split('\n').map((s) => s.trim()).filter(Boolean)
    if (pairList.length === 0) return
    const timerange = `${dateStart.replace(/-/g, '')}-${dateEnd.replace(/-/g, '')}`
    downloadMutation.mutate({
      pairs: pairList,
      timeframes: [timeframe],
      exchange,
      timerange,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">数据下载 & 管理</h2>
        <p className="text-sm text-[#8b949e] mt-0.5">下载历史 OHLCV 数据，管理已下载的数据文件</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Download Form */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" />
            下载配置
          </h3>

          <FormField label="交易所">
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
            >
              {['binance', 'kraken', 'coinbase', 'bybit', 'okx'].map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </FormField>

          <FormField label="交易对 (每行一个)">
            <textarea
              rows={4}
              value={pairs}
              onChange={(e) => setPairs(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] resize-none font-mono placeholder-[#8b949e]"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="时间框架">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              >
                {['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'].map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </FormField>
            <FormField label="数据格式">
              <div className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#8b949e]">
                跟随配置文件
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="开始日期">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              />
            </FormField>
            <FormField label="结束日期">
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3]"
              />
            </FormField>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            className="w-full py-2 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloadMutation.isPending ? '下载中...' : '开始下载'}
          </button>

          {downloadMutation.isSuccess && (
            <p className="text-xs text-[#3fb950] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 下载任务已启动
            </p>
          )}
          {downloadMutation.isError && (
            <p className="text-xs text-[#f85149] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {(downloadMutation.error as Error).message}
            </p>
          )}
        </div>

        {/* Data Files */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              数据文件 ({dataFiles.length})
            </h3>
            <button
              onClick={loadDataFiles}
              className="p-1 rounded hover:bg-[#1c2128] transition-colors text-[#8b949e]"
              title="刷新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadError ? (
            <div className="py-8 text-center">
              <AlertCircle className="w-8 h-8 text-[#d2991d] mx-auto mb-2" />
              <p className="text-sm text-[#8b949e]">{loadError}</p>
              <p className="text-xs text-[#8b949e] mt-1">
                {window.electronAPI ? '数据目录为空或不存在' : '浏览器模式不支持文件浏览'}
              </p>
            </div>
          ) : dataFiles.length === 0 ? (
            <div className="py-8 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-[#8b949e]">暂无数据文件</p>
              <p className="text-xs text-[#8b949e] mt-1">下载历史数据后在此管理</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {dataFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-[#0d1117] hover:bg-[#1c2128] transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-mono text-[#e6edf3]">{file.pair}</p>
                    <p className="text-xs text-[#8b949e]">
                      {file.timeframe} · {formatSize(file.size)} · .{file.ext}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(file.name)}
                    disabled={deleting === file.name}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#f85149]/10 text-[#8b949e] hover:text-[#f85149] transition-all disabled:opacity-50"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {dataPath && (
            <div className="mt-4 p-3 rounded-md bg-[#0d1117]">
              <p className="text-xs text-[#8b949e]">数据目录</p>
              <p className="text-xs font-mono text-[#e6edf3] mt-0.5 break-all">{dataPath}</p>
            </div>
          )}
        </div>
      </div>

      {/* Backtest Records */}
      {recentHistory.length > 0 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <FileType className="w-4 h-4" />
            近期回测记录
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {recentHistory.map((entry) => (
              <div
                key={entry.run_id}
                className="p-3 rounded-md bg-[#0d1117]"
              >
                <p className="text-sm font-medium">{entry.strategy}</p>
                <p className="text-xs text-[#8b949e]">
                  {entry.timeframe ?? '5m'} ·{' '}
                  {entry.backtest_start_time
                    ? new Date(entry.backtest_start_time * 1000).toLocaleDateString('zh-CN')
                    : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-[#8b949e] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
