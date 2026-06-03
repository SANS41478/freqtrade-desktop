import { useState, useEffect, useCallback } from 'react'
import { configService, type ConfigData } from '@/lib/config-service'
import { Save, CheckCircle, Upload, Download, AlertCircle, RefreshCw } from 'lucide-react'

type ConfigSection = 'trading' | 'exchange' | 'api' | 'telegram' | 'pairlists' | 'orders' | 'trailing' | 'protection'

const SECTIONS: { id: ConfigSection; label: string }[] = [
  { id: 'trading', label: '交易设置' },
  { id: 'exchange', label: '交易所' },
  { id: 'api', label: 'API 服务器' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'pairlists', label: '交易对列表' },
  { id: 'orders', label: '订单类型' },
  { id: 'trailing', label: '跟踪止损' },
  { id: 'protection', label: '风控保护' },
]

const DEFAULT_CONFIG: ConfigData = {
  trading_mode: 'spot',
  margin_mode: '',
  stake_currency: 'USDT',
  stake_amount: 'unlimited',
  max_open_trades: 5,
  dry_run: true,
  exchange: { name: 'binance', key: '', secret: '', password: '' },
  api_server: {
    enabled: true,
    listen_ip_address: '127.0.0.1',
    listen_port: 8080,
    username: 'freqtrader',
    password: '',
    jwt_secret_key: '',
    ws_token: '',
  },
  telegram: { enabled: false, token: '', chat_id: '' },
  pairlists: [{ method: 'VolumePairList', number_assets: 20, sort_key: 'quoteVolume' }],
  order_types: {
    entry: 'limit', exit: 'limit', stoploss: 'limit',
    force_entry: 'limit', force_exit: 'limit', emergency_exit: 'market',
  },
  stoploss: -0.10,
  trailing_stop: true,
  minimal_roi: { '0': 0.01, '60': 0.02, '1440': 0.05 },
}

export function ConfigEditor() {
  const [section, setSection] = useState<ConfigSection>('trading')
  const [config, setConfig] = useState<ConfigData>(DEFAULT_CONFIG)
  const [configPath, setConfigPath] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null)

  // Load config on mount
  const loadConfig = useCallback(async () => {
    setLoading(true)
    const path = await configService.getPath()
    setConfigPath(path)

    const data = await configService.read()
    if (data) {
      setConfig({ ...DEFAULT_CONFIG, ...data })
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  const updateConfig = (path: string[], value: unknown) => {
    setConfig((prev) => {
      const next = { ...prev }
      let obj: Record<string, unknown> = next
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]] || typeof obj[path[i]] !== 'object') {
          obj[path[i]] = {}
        }
        obj = obj[path[i]] as Record<string, unknown>
      }
      obj[path[path.length - 1]] = value
      return next
    })
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await configService.write(config)
    setSaving(false)
    if (ok) {
      setSaveStatus('success')
      setSaveMessage('配置已保存')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('error')
      setSaveMessage('保存失败（浏览器开发模式下不支持写入文件）')
    }
  }

  const handleValidate = () => {
    setValidation(configService.validate(config))
  }

  const handleExport = async () => {
    const exported = await configService.export()
    if (exported) {
      setSaveStatus('success')
      setSaveMessage(`已导出到 ${exported}`)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleImport = async () => {
    const imported = await configService.import()
    if (imported) {
      await loadConfig()
      setSaveStatus('success')
      setSaveMessage('配置已导入')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-secondary rounded" />
          <div className="h-4 w-64 bg-secondary rounded" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-96 bg-secondary rounded-lg" />
            <div className="col-span-3 h-96 bg-secondary rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">配置编辑器</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {configPath || 'config.json'}
            {' · '}
            {config.exchange ? ((config.exchange as Record<string, unknown>).name as string) ?? '未知' : '未知'}
            {' · '}
            {config.dry_run ? '模拟交易' : '实盘交易'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            验证
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              saveStatus === 'success'
                ? 'bg-success text-success-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? '保存中...' : saveStatus === 'success' ? '已保存' : '保存配置'}
          </button>
        </div>
      </div>

      {/* Save feedback */}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* Validation errors */}
      {validation && !validation.valid && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm space-y-1">
          <p className="font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> 配置验证失败:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {validation?.valid && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm">
          <CheckCircle className="w-4 h-4" />
          配置验证通过
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {/* Section Nav */}
        <div className="col-span-1 bg-card border border-border rounded-lg p-3 card-glow space-y-1 self-start">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                section === id
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="col-span-3 bg-card border border-border rounded-lg p-5 card-glow space-y-5">
          {section === 'trading' && (
            <TradingSection config={config} updateConfig={updateConfig} />
          )}
          {section === 'exchange' && (
            <ExchangeSection config={config} updateConfig={updateConfig} />
          )}
          {section === 'api' && (
            <ApiSection config={config} updateConfig={updateConfig} />
          )}
          {section === 'telegram' && (
            <TelegramSection config={config} updateConfig={updateConfig} />
          )}
          {section === 'pairlists' && (
            <PairlistsSection config={config} updateConfig={updateConfig} />
          )}
          {section === 'orders' && (
            <OrdersSection config={config} updateConfig={updateConfig} />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Section Components
// ============================================================

function TradingSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const roi = (config.minimal_roi as Record<string, number>) ?? {}

  return (
    <>
      <SectionHeader title="交易设置" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="交易模式">
          <SelectField
            value={String(config.trading_mode ?? 'spot')}
            onChange={(v) => updateConfig(['trading_mode'], v)}
            options={[
              { value: 'spot', label: 'spot (现货)' },
              { value: 'margin', label: 'margin (保证金)' },
              { value: 'futures', label: 'futures (合约)' },
            ]}
          />
        </FormField>
        <FormField label="运行模式">
          <SelectField
            value={config.dry_run ? 'dry_run' : 'live'}
            onChange={(v) => updateConfig(['dry_run'], v === 'dry_run')}
            options={[
              { value: 'dry_run', label: 'dry_run (模拟交易)' },
              { value: 'live', label: 'live (实盘交易)' },
            ]}
          />
        </FormField>
        <FormField label="基础货币">
          <input
            type="text"
            value={String(config.stake_currency ?? 'USDT')}
            onChange={(e) => updateConfig(['stake_currency'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="每笔投入金额">
          <input
            type="text"
            value={String(config.stake_amount ?? 'unlimited')}
            onChange={(e) => updateConfig(['stake_amount'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="最大持仓数">
          <input
            type="number"
            value={config.max_open_trades ?? 5}
            onChange={(e) => updateConfig(['max_open_trades'], Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="策略名称">
          <input
            type="text"
            value={String(config.strategy ?? '')}
            onChange={(e) => updateConfig(['strategy'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="SampleStrategy"
          />
        </FormField>
      </div>

      <SectionHeader title="止损设置" />
      <div className="grid grid-cols-3 gap-4">
        <FormField label="止损比例">
          <input
            type="text"
            value={String(config.stoploss ?? -0.10)}
            onChange={(e) => updateConfig(['stoploss'], parseFloat(e.target.value) || -0.10)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            {((config.stoploss as number) ?? -0.10) * 100}%
          </p>
        </FormField>
        <FormField label="移动止损">
          <SelectField
            value={config.trailing_stop ? 'true' : 'false'}
            onChange={(v) => updateConfig(['trailing_stop'], v === 'true')}
            options={[{ value: 'true', label: '启用' }, { value: 'false', label: '禁用' }]}
          />
        </FormField>
        <FormField label="止损上链">
          <SelectField
            value={config.stoploss_on_exchange ? 'true' : 'false'}
            onChange={(v) => updateConfig(['stoploss_on_exchange'], v === 'true')}
            options={[{ value: 'true', label: '启用' }, { value: 'false', label: '禁用' }]}
          />
        </FormField>
      </div>

      <SectionHeader title="最小 ROI 表" />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left py-2 font-medium">时间 (分钟)</th>
            <th className="text-left py-2 font-medium">目标收益率</th>
            <th className="text-right py-2 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(roi).map(([time, value]) => (
            <tr key={time} className="border-b border-border/50">
              <td className="py-2">
                <input
                  type="number"
                  value={time}
                  onChange={(e) => {
                    const newRoi = { ...roi }
                    delete newRoi[time]
                    newRoi[e.target.value] = value
                    updateConfig(['minimal_roi'], newRoi)
                  }}
                  className="w-24 px-2 py-1 rounded text-sm bg-secondary border border-border text-foreground"
                />
              </td>
              <td className="py-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newRoi = { ...roi, [time]: parseFloat(e.target.value) || 0 }
                    updateConfig(['minimal_roi'], newRoi)
                  }}
                  className="w-24 px-2 py-1 rounded text-sm bg-secondary border border-border text-foreground"
                />
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={() => {
                    const newRoi = { ...roi }
                    delete newRoi[time]
                    updateConfig(['minimal_roi'], newRoi)
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          const newRoi = { ...roi, '0': 0.01 }
          updateConfig(['minimal_roi'], newRoi)
        }}
        className="mt-2 text-xs text-primary hover:underline"
      >
        + 添加行
      </button>
    </>
  )
}

function ExchangeSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const exchange = (config.exchange ?? {}) as Record<string, unknown>
  return (
    <>
      <SectionHeader title="交易所配置" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="交易所名称">
          <SelectField
            value={String(exchange.name ?? 'binance')}
            onChange={(v) => updateConfig(['exchange', 'name'], v)}
            options={[
              { value: 'binance', label: 'Binance' },
              { value: 'kraken', label: 'Kraken' },
              { value: 'coinbase', label: 'Coinbase' },
              { value: 'bybit', label: 'Bybit' },
              { value: 'okx', label: 'OKX' },
            ]}
          />
        </FormField>
        <FormField label="API Key">
          <input
            type="password"
            value={String(exchange.key ?? '')}
            onChange={(e) => updateConfig(['exchange', 'key'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="your_api_key"
          />
        </FormField>
        <FormField label="Secret Key">
          <input
            type="password"
            value={String(exchange.secret ?? '')}
            onChange={(e) => updateConfig(['exchange', 'secret'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="your_secret_key"
          />
        </FormField>
        <FormField label="密码 (如有)">
          <input
            type="password"
            value={String(exchange.password ?? '')}
            onChange={(e) => updateConfig(['exchange', 'password'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="可选"
          />
        </FormField>
      </div>
    </>
  )
}

function ApiSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const api = (config.api_server ?? {}) as Record<string, unknown>
  return (
    <>
      <SectionHeader title="API 服务器" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="启用 API">
          <SelectField
            value={api.enabled ? 'true' : 'false'}
            onChange={(v) => updateConfig(['api_server', 'enabled'], v === 'true')}
            options={[{ value: 'true', label: '是' }, { value: 'false', label: '否' }]}
          />
        </FormField>
        <FormField label="监听端口">
          <input
            type="number"
            value={Number(api.listen_port ?? 8080)}
            onChange={(e) => updateConfig(['api_server', 'listen_port'], Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="用户名">
          <input
            type="text"
            value={String(api.username ?? 'freqtrader')}
            onChange={(e) => updateConfig(['api_server', 'username'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="密码">
          <input
            type="password"
            value={String(api.password ?? '')}
            onChange={(e) => updateConfig(['api_server', 'password'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="JWT Secret">
          <input
            type="password"
            value={String(api.jwt_secret_key ?? '')}
            onChange={(e) => updateConfig(['api_server', 'jwt_secret_key'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="WS Token">
          <input
            type="text"
            value={String(api.ws_token ?? '')}
            onChange={(e) => updateConfig(['api_server', 'ws_token'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
      </div>
    </>
  )
}

function TelegramSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const telegram = (config.telegram ?? {}) as Record<string, unknown>
  return (
    <>
      <SectionHeader title="Telegram 通知" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="启用 Telegram">
          <SelectField
            value={telegram.enabled ? 'true' : 'false'}
            onChange={(v) => updateConfig(['telegram', 'enabled'], v === 'true')}
            options={[{ value: 'true', label: '是' }, { value: 'false', label: '否' }]}
          />
        </FormField>
        <FormField label="Bot Token">
          <input
            type="password"
            value={String(telegram.token ?? '')}
            onChange={(e) => updateConfig(['telegram', 'token'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="123456:ABC-DEF1234ghikl"
          />
        </FormField>
        <FormField label="Chat ID">
          <input
            type="text"
            value={String(telegram.chat_id ?? '')}
            onChange={(e) => updateConfig(['telegram', 'chat_id'], e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
            placeholder="your_chat_id"
          />
        </FormField>
      </div>
    </>
  )
}

function PairlistsSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const pairlist = ((config.pairlists as Record<string, unknown>[]) ?? [{}])[0] ?? {}
  return (
    <>
      <SectionHeader title="交易对列表" />
      <div className="space-y-4">
        <FormField label="方法">
          <SelectField
            value={String(pairlist.method ?? 'VolumePairList')}
            onChange={(v) => updateConfig(['pairlists', '0', 'method'], v)}
            options={[
              { value: 'VolumePairList', label: 'VolumePairList (成交量)' },
              { value: 'StaticPairList', label: 'StaticPairList (静态)' },
              { value: 'PrecisionFilter', label: 'PrecisionFilter (精度过滤)' },
              { value: 'PriceFilter', label: 'PriceFilter (价格过滤)' },
            ]}
          />
        </FormField>
        <FormField label="交易对数量">
          <input
            type="number"
            value={Number(pairlist.number_assets ?? 20)}
            onChange={(e) => updateConfig(['pairlists', '0', 'number_assets'], Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
          />
        </FormField>
        <FormField label="排序依据">
          <SelectField
            value={String(pairlist.sort_key ?? 'quoteVolume')}
            onChange={(v) => updateConfig(['pairlists', '0', 'sort_key'], v)}
            options={[
              { value: 'quoteVolume', label: 'quoteVolume (成交额)' },
              { value: 'volume', label: 'volume (成交量)' },
            ]}
          />
        </FormField>
      </div>
    </>
  )
}

function OrdersSection({ config, updateConfig }: {
  config: ConfigData
  updateConfig: (path: string[], value: unknown) => void
}) {
  const orderTypes = (config.order_types ?? {}) as Record<string, string>
  return (
    <>
      <SectionHeader title="订单类型" />
      <div className="grid grid-cols-2 gap-4">
        {[
          ['入场单', 'entry'], ['出场单', 'exit'],
          ['止损单', 'stoploss'], ['强制入场', 'force_entry'],
          ['强制出场', 'force_exit'], ['紧急出场', 'emergency_exit'],
        ].map(([label, key]) => (
          <FormField key={key} label={label}>
            <SelectField
              value={orderTypes[key] ?? 'limit'}
              onChange={(v) => updateConfig(['order_types', key], v)}
              options={[
                { value: 'limit', label: 'limit (限价单)' },
                { value: 'market', label: 'market (市价单)' },
              ]}
            />
          </FormField>
        ))}
      </div>
    </>
  )
}

// ============================================================
// Reusable Form Components
// ============================================================


function TrailingSection({ config, updateConfig }: { config: ConfigData; updateConfig: (path: string[], value: unknown) => void }) {
  return (
    <>
      <SectionHeader title={'跟踪止损配置'} />
      <div className="space-y-4">
        <FormField label={"启用跟踪止损"}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.trailing_stop}
              onChange={(e) => updateConfig(['trailing_stop'], e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">{'开启后监控盈利时自动上移止损位'}</span>
          </label>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label={"止损正向偏移量 (零值上方时触发)"}>
            <input type="number" step="0.01" value={config.trailing_stop_positive ?? 0}
              onChange={(e) => updateConfig(['trailing_stop_positive'], Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono" />
            <p className="text-[10px] text-muted-foreground mt-1">{'例如 0.02 表示盈利 2% 后开始跟踪'}</p>
          </FormField>
          <FormField label={"跟踪偏移均值的偏移量"}>
            <input type="number" step="0.01" value={config.trailing_stop_positive_offset ?? 0}
              onChange={(e) => updateConfig(['trailing_stop_positive_offset'], Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono" />
            <p className="text-[10px] text-muted-foreground mt-1">{'例如 0.03 表示盈利达到 3% 后偏移量才生效'}</p>
          </FormField>
        </div>
        <FormField label={"仅偏移量到达时才启用跟踪"}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.trailing_only_offset_is_reached}
              onChange={(e) => updateConfig(['trailing_only_offset_is_reached'], e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">{'只有当盈利达到 trailing_stop_positive + offset 时才启用跟踪'}</span>
          </label>
        </FormField>
        <FormField label={"止损在交易所保存"}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.stoploss_on_exchange}
              onChange={(e) => updateConfig(['stoploss_on_exchange'], e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">{'将止损单直接下发到交易所（需支持的交易所）'}</span>
          </label>
        </FormField>
      </div>
    </>
  )
}

function ProtectionSection({ config, updateConfig }: { config: ConfigData; updateConfig: (path: string[], value: unknown) => void }) {
  return (
    <>
      <SectionHeader title={'风控保护配置'} />
      <div className="space-y-4">
        <FormField label={"最大持仓数量"}>
          <input type="number" value={config.max_open_trades ?? 5}
            onChange={(e) => updateConfig(['max_open_trades'], Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono" />
        </FormField>
        <FormField label={"可用资金 (留空使用全部)"}>
          <input type="text" value={String(config.available_capital ?? '')}
            onChange={(e) => updateConfig(['available_capital'], e.target.value ? Number(e.target.value) : null)}
            placeholder="留空使用全部资金"
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono placeholder-muted-foreground" />
          <p className="text-[10px] text-muted-foreground mt-1">{'可用于交易的最大资金量，留空则使用全部余额'}</p>
        </FormField>
        <FormField label={"持仓金额"}>
          <input type="text" value={String(config.stake_amount ?? 'unlimited')}
            onChange={(e) => updateConfig(['stake_amount'], e.target.value)}
            placeholder="unlimited"
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono placeholder-muted-foreground" />
          <p className="text-[10px] text-muted-foreground mt-1">{'每笔交易的投入金额，unlimited 表示自动计算'}</p>
        </FormField>
        <FormField label={"最大加仓调整次数"}>
          <input type="number" value={config.max_entry_position_adjustment ?? 0}
            onChange={(e) => updateConfig(['max_entry_position_adjustment'], Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border font-mono" />
          <p className="text-[10px] text-muted-foreground mt-1">{'当仓位与预期不符时，允许加仓的次数'}</p>
        </FormField>
        <FormField label={"加仓功能"}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.position_adjustment_enable}
              onChange={(e) => updateConfig(['position_adjustment_enable'], e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">{'允许随件加仓（DCA）'}</span>
          </label>
        </FormField>
        <FormField label={"布局模式"}>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer">
              <input type="radio" name="trading_mode" value="spot"
                checked={config.trading_mode === 'spot'}
                onChange={(e) => updateConfig(['trading_mode'], e.target.value)} />
              <span className="text-sm">Spot ({'现货'})</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer">
              <input type="radio" name="trading_mode" value="futures"
                checked={config.trading_mode === 'futures'}
                onChange={(e) => updateConfig(['trading_mode'], e.target.value)} />
              <span className="text-sm">Futures ({'合约'})</span>
            </label>
          </div>
        </FormField>
        <FormField label={"短仓允许"}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!config.short_allowed}
              onChange={(e) => updateConfig(['short_allowed'], e.target.checked)} className="rounded border-border" />
            <span className="text-sm text-muted-foreground">{'允许做空策略'}</span>
          </label>
        </FormField>
      </div>
    </>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-3">
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options }: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
