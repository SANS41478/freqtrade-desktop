import { useState, useEffect } from 'react'
import { type TabId } from '@/App'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BarChart3, Clock, Code2, Settings, Download,
  Activity, FileText, CandlestickChart, Zap, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react'

const navItems: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'trades', label: '交易记录', icon: Activity },
  { id: 'candles', label: 'K线图表', icon: CandlestickChart },
  { id: 'backtest', label: '回测中心', icon: Clock },
  { id: 'hyperopt', label: '超参优化', icon: Zap },
  { id: 'strategy', label: '策略管理', icon: Code2 },
  { id: 'config', label: '配置编辑器', icon: Settings },
  { id: 'data', label: '数据下载', icon: Download },
  { id: 'management', label: '交易管理', icon: Shield },
  { id: 'logs', label: '日志查看器', icon: FileText },
]

const STORAGE_KEY = 'freqtrade-sidebar-collapsed'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[#21262d] bg-[#161b22] h-full transition-all duration-200',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Logo area */}
      <div className={cn(
        'border-b border-[#21262d] transition-all',
        collapsed ? 'px-2 py-3' : 'px-4 py-4',
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#f97316] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            F
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xs font-semibold text-[#e6edf3] tracking-wide">Freqtrade Desktop</h1>
              <p className="text-[10px] text-[#8b949e] font-mono">v{__APP_VERSION__}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-3 space-y-0.5', collapsed ? 'px-1.5' : 'px-2')}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            title={collapsed ? label : undefined}
            className={cn(
              'flex items-center rounded-md text-xs font-medium transition-all duration-150',
              collapsed
                ? 'justify-center w-10 h-9 mx-auto'
                : 'w-full gap-2.5 px-3 py-1.5',
              activeTab === id
                ? 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20'
                : 'text-[#8b949e] hover:bg-[#1c2128] hover:text-[#e6edf3] border border-transparent',
            )}
          >
            <Icon className={cn('flex-shrink-0', collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* Status bar */}
      <div className={cn('border-t border-[#21262d]', collapsed ? 'px-2 py-3' : 'px-4 py-3')}>
        {!collapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              <span className="text-[10px] text-[#8b949e] font-mono">127.0.0.1:8080</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d2991d]" />
              <span className="text-[10px] text-[#8b949e]">Dry-Run</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#d2991d]" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[#21262d] p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-full rounded-md text-[#8b949e] hover:bg-[#1c2128] hover:text-[#e6edf3] transition-colors',
            collapsed ? 'py-2' : 'py-1.5',
          )}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  )
}
