import { useState, useEffect } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true)
      window.electronAPI.windowIsMaximized().then(setIsMaximized)
      window.electronAPI.onWindowMaximized((maximized: boolean) => setIsMaximized(maximized))
    }
  }, [])

  if (!isElectron) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-9 bg-[#0d1117] border-b border-[#21262d] select-none"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* App name */}
      <div className="flex items-center gap-2 pl-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
        <span className="text-xs font-medium text-[#8b949e] tracking-wide">Freqtrade Desktop</span>
      </div>

      {/* Window controls */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => window.electronAPI?.windowMinimize()}
          className="w-11 h-full flex items-center justify-center hover:bg-[#21262d] transition-colors text-[#8b949e] hover:text-[#e6edf3]"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.windowMaximize()}
          className="w-11 h-full flex items-center justify-center hover:bg-[#21262d] transition-colors text-[#8b949e] hover:text-[#e6edf3]"
        >
          {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          onClick={() => window.electronAPI?.windowClose()}
          className="w-11 h-full flex items-center justify-center hover:bg-[#da3633] transition-colors text-[#8b949e] hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
