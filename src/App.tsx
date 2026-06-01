import { useState, useEffect, lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { TitleBar } from '@/components/layout/TitleBar'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { BotStatusBanner } from '@/components/layout/BotStatusBanner'
import { ConnectionStatus } from '@/components/layout/ConnectionStatus'
import { Dashboard } from '@/pages/Dashboard'
import { TradesPage } from '@/pages/Trades'
import { useTradeNotifications } from '@/hooks/useTradeNotifications'
import { api } from '@/lib/api'

// Lazy-loaded pages (code splitting)
const BacktestPage = lazy(() => import('@/pages/Backtest').then((m) => ({ default: m.BacktestPage })))
const StrategyPage = lazy(() => import('@/pages/Strategy').then((m) => ({ default: m.StrategyPage })))
const ConfigEditor = lazy(() => import('@/pages/ConfigEditor').then((m) => ({ default: m.ConfigEditor })))
const DataDownload = lazy(() => import('@/pages/DataDownload').then((m) => ({ default: m.DataDownload })))
const LogViewer = lazy(() => import('@/pages/LogViewer').then((m) => ({ default: m.LogViewer })))
const Candles = lazy(() => import('@/pages/Candles').then((m) => ({ default: m.Candles })))
const HyperoptPage = lazy(() => import('@/pages/HyperoptPage').then((m) => ({ default: m.HyperoptPage })))
const TradeDetail = lazy(() => import('@/pages/TradeDetail').then((m) => ({ default: m.TradeDetail })))
const ManagementPage = lazy(() => import('@/pages/ManagementPage').then((m) => ({ default: m.ManagementPage })))

export type TabId = 'dashboard' | 'trades' | 'backtest' | 'strategy' | 'config' | 'data' | 'logs' | 'candles' | 'hyperopt' | 'trade-detail' | 'management'

const ALL_TABS: TabId[] = ['dashboard', 'trades', 'backtest', 'strategy', 'config', 'data', 'logs', 'candles', 'hyperopt', 'trade-detail', 'management']

function PageLoader() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 w-32 bg-[#161b22] rounded" />
      <div className="h-4 w-64 bg-[#161b22] rounded" />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-[#161b22] rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null)

  useTradeNotifications()

  const { isError: botNotRunning } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30000,
    retry: false,
  })

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNavigate((tab: string, id?: number) => {
        if (tab === 'trades' && id !== undefined) {
          setSelectedTradeId(id)
          setActiveTab('trade-detail')
        } else if (ALL_TABS.includes(tab as TabId)) {
          setActiveTab(tab as TabId)
        }
      })
    }
  }, [])

  const handleTradeClick = (tradeId: number) => {
    setSelectedTradeId(tradeId)
    setActiveTab('trade-detail')
  }

  const renderTab = () => {
    const tab = activeTab
    switch (tab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} onTradeClick={handleTradeClick} />
      case 'trades': return <TradesPage onTradeClick={handleTradeClick} />
      case 'backtest': return <BacktestPage />
      case 'strategy': return <StrategyPage />
      case 'config': return <ConfigEditor />
      case 'data': return <DataDownload />
      case 'logs': return <LogViewer />
      case 'candles': return <Candles />
      case 'hyperopt': return <HyperoptPage />
      case 'management': return <ManagementPage />
      case 'trade-detail':
        return selectedTradeId ? (
          <TradeDetail tradeId={selectedTradeId} onBack={() => setActiveTab('trades')} />
        ) : (
          <div className="p-6 text-center text-[#8b949e]">未选择交易</div>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117]">
      <TitleBar />
      <div className="flex items-center justify-between border-b border-[#21262d]">
        <BotStatusBanner isRunning={!botNotRunning} />
        <div className="pr-4 flex items-center">
          <ConnectionStatus onNavigate={(tab) => setActiveTab(tab as TabId)} />
        </div>
      </div>
      <div className="flex flex-1 pt-9 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <div key={activeTab} className="animate-in fade-in">
                {renderTab()}
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
