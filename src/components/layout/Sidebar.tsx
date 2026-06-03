import { useState, useEffect } from 'react'
import { type TabId } from '@/App'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BarChart3, Clock, Code2, Settings, Download,
  Activity, FileText, CandlestickChart, Zap, ChevronLeft, ChevronRight, Shield, List,
} from 'lucide-react'

const navItems: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'trades', label: '交易记录', icon: Activity },
  { id: 'candles', label: 'K线图表', icon: CandlestickChart },
  { id: 'backtest', label: '回测中心', icon: Clock },
  { id: 'hyperopt', label: '超参优化', icon: Zap },
  { id: 'strategy', label: '策略管理', icon: Code2 },
  { id: 'config', label: '配置编辑器', icon: Settings },
  { id: 'pairlist', label: '交易对列表', icon: List },
  { id: 'data', label: '数据下载', icon: Download },
  { id: 'management', label: '交易管理', icon: Shield },
  { id: 'logs', label: '日志查看器', icon: FileText },
]

const STORAGE_KEY = 'freqtrade-sidebar-collapsed'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  dryRun?: boolean
}

export function Sidebar({ activeTab, onTabChange, dryRun }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card h-full transition-all duration-200',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      {/* Logo area */}
      <div className={cn(
        'border-b border-border transition-all',
        collapsed ? 'px-2 py-3' : 'px-4 py-4',
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
            F
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xs font-semibold tracking-wide">Freqtrade Desktop</h1>
              <p className="text-[10px] text-muted-foreground font-mono">v{__APP_VERSION__}</p>
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
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent',
            )}
          >
            <Icon className={cn('flex-shrink-0', collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {/* Status bar */}
      <div className={cn('border-t border-border', collapsed ? 'px-2 py-3' : 'px-4 py-3')}>
        {!collapsed ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[10px] text-muted-foreground font-mono">127.0.0.1:8080</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('w-1.5 h-1.5 rounded-full', dryRun ? 'bg-warning' : 'bg-success')} />
              <span className="text-[10px] text-muted-foreground">{dryRun ? 'Dry-Run' : 'Live'}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className={cn('w-1.5 h-1.5 rounded-full', dryRun ? 'bg-warning' : 'bg-success')} />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-full rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
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