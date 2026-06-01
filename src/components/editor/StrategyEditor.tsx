import { useState, useEffect, useCallback, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Save, Play, X, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface StrategyEditorProps {
  strategyName: string
  initialCode: string
  onClose: () => void
  onSaved: (name: string, code: string) => void
}

export const PYTHON_TEMPLATE = `# {name} strategy
from freqtrade.strategy import IStrategy
import talib.abstract as ta
import pandas as pd

class {name}(IStrategy):
    INTERFACE_VERSION = 3
    timeframe = '5m'
    can_short = False
    minimal_roi = {"0": 0.01, "60": 0.02, "1440": 0.05}
    stoploss = -0.10
    trailing_stop = True

    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['ema_short'] = ta.EMA(dataframe, timeperiod=12)
        dataframe['ema_long'] = ta.EMA(dataframe, timeperiod=26)
        return dataframe

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[
            (dataframe['rsi'] < 30) & (dataframe['ema_short'] > dataframe['ema_long']),
            'enter_long'
        ] = 1
        return dataframe

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        dataframe.loc[
            (dataframe['rsi'] > 70),
            'exit_long'
        ] = 1
        return dataframe
`

export function StrategyEditor({ strategyName, initialCode, onClose, onSaved }: StrategyEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [fileName, setFileName] = useState(strategyName)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (code !== initialCode) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [code, initialCode])

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor

    // Python-specific settings
    monaco.languages.setLanguageConfiguration('python', {
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    })

    // Register Freqtrade-specific completions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monacoEditor = monaco as any
    monacoEditor.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: editor.ITextModel, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: any[] = [
          // IStrategy methods
          ...['populate_indicators', 'populate_entry_trend', 'populate_exit_trend',
            'custom_stoploss', 'custom_entry_price', 'custom_exit_price',
            'confirm_trade_entry', 'confirm_trade_exit',
            'check_entry_timeout', 'check_exit_timeout',
          ].map((m) => ({
            label: m,
            kind: monacoEditor.languages.CompletionItemKind.Method,
            insertText: `${m}(self, ${m.includes('price') ? 'pair: str, trade: Trade, current_time: datetime, proposed_rate: float, entry_tag: str | None, side: str' : m.includes('stoploss') ? 'pair: str, trade: Trade, current_time: datetime, current_rate: float, current_profit: float, **kwargs' : m.includes('timeout') ? 'pair: str, trade: Trade, current_time: datetime' : 'dataframe: pd.DataFrame, metadata: dict'}) -> ${m.includes('trend') ? 'pd.DataFrame' : 'float | None'}:\n        `,
            range,
            documentation: `Override ${m} in your strategy`,
          })),
          // Common imports
          { label: 'import talib.abstract as ta', kind: monacoEditor.languages.CompletionItemKind.Snippet, insertText: 'import talib.abstract as ta', range },
          { label: 'import pandas as pd', kind: monacoEditor.languages.CompletionItemKind.Snippet, insertText: 'import pandas as pd', range },
          { label: 'from freqtrade.strategy import IStrategy', kind: monacoEditor.languages.CompletionItemKind.Snippet, insertText: 'from freqtrade.strategy import IStrategy', range },
          { label: 'from freqtrade.strategy import IntParameter', kind: monacoEditor.languages.CompletionItemKind.Snippet, insertText: 'from freqtrade.strategy import IntParameter, DecimalParameter, CategoricalParameter', range },
          // Hyperopt parameters
          ...['IntParameter', 'DecimalParameter', 'RealParameter', 'CategoricalParameter', 'BooleanParameter'].map((p) => ({
            label: p,
            kind: monacoEditor.languages.CompletionItemKind.Class,
            insertText: `${p}(low={}, high={}, default={}, space='buy')`,
            range,
            documentation: `Hyperopt ${p}`,
          })),
          // TA functions
          ...['RSI', 'EMA', 'SMA', 'MACD', 'BBANDS', 'STOCH', 'ATR', 'ADX', 'OBV', 'MFI'].map((ta) => ({
            label: `ta.${ta}`,
            kind: monacoEditor.languages.CompletionItemKind.Function,
            insertText: `ta.${ta}(dataframe, ${ta === 'BBANDS' ? 'timeperiod=20' : 'timeperiod=14'})`,
            range,
          })),
        ]
        return { suggestions }
      },
    })

    // Keyboard shortcuts
    editor.addAction({
      id: 'save-strategy',
      label: 'Save Strategy',
      keybindings: [monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyCode.KeyS],
      run: () => handleSave(),
    })

    editor.focus()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.strategyWrite(fileName, code)
        if (result.success) {
          setStatus('saved')
          setStatusMsg('保存成功')
          onSaved(fileName, code)
          setTimeout(() => setStatus('idle'), 3000)
        } else {
          setStatus('error')
          setStatusMsg(result.error ?? '保存失败')
        }
      } else {
        // Browser dev mode: download as file
        const blob = new Blob([code], { type: 'text/x-python' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.py`
        a.click()
        URL.revokeObjectURL(url)
        setStatus('saved')
        setStatusMsg('已下载 (浏览器模式)')
        onSaved(fileName, code)
        setTimeout(() => setStatus('idle'), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = async () => {
    const name = prompt('新策略名称 (不含 .py):')
    if (!name) return
    const newCode = PYTHON_TEMPLATE.replace(/\{name\}/g, name)
    if (window.electronAPI) {
      const result = await window.electronAPI.strategyCreate(name)
      if (result.success) {
        setFileName(name)
        setCode(newCode)
        setStatus('saved')
        setStatusMsg(`策略 "${name}" 已创建`)
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setStatusMsg(result.error ?? '创建失败')
      }
    } else {
      setFileName(name)
      setCode(newCode)
    }
  }

  const handleImport = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.strategyList()
      if (result.success && result.files) {
        const names = result.files.map((f) => f.name).join('\n')
        const selected = prompt(`可用策略:\n${names}\n\n输入要打开的策名:`)
        if (selected && result.files.find((f) => f.name === selected)) {
          const file = await window.electronAPI.strategyRead(selected)
          if (file.success && file.code) {
            setFileName(selected)
            setCode(file.code)
          }
        }
      }
    }
  }

  const isModified = code !== initialCode

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">strategies/</span>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value.replace(/\.py$/, ''))}
                className="px-2 py-0.5 bg-secondary border border-border rounded text-sm font-medium text-foreground focus:outline-none focus:border-primary w-48"
              />
              <span className="text-xs text-muted-foreground">.py</span>
              {isModified && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">未保存</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status */}
            {status === 'saved' && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {statusMsg}
              </span>
            )}
            {status === 'error' && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {statusMsg}
              </span>
            )}

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={handleCreateNew}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-1.5"
              title="新建策略"
            >
              <Upload className="w-3.5 h-3.5" />
              新建
            </button>
            <button
              onClick={handleImport}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-1.5"
              title="打开策略"
            >
              <Download className="w-3.5 h-3.5" />
              打开
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-success text-success-foreground hover:bg-success/90 transition-colors flex items-center gap-1.5"
              title="保存并回测此策略"
            >
              <Play className="w-3.5 h-3.5" />
              回测
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-secondary transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              关闭
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? '')}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              insertSpaces: true,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              autoIndent: 'full',
              formatOnPaste: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 16, bottom: 16 },
              guides: { indentation: true, bracketPairs: true },
              suggest: { showKeywords: true, showSnippets: true },
              quickSuggestions: true,
              contextmenu: true,
            }}
            loading={
              <div className="h-full flex items-center justify-center bg-background">
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">加载编辑器...</p>
                </div>
              </div>
            }
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-card text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Python</span>
            <span>UTF-8</span>
            <span>空格缩进: 4</span>
            <span>{code.split('\n').length} 行</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ctrl+S 保存</span>
            <span>Ctrl+Space 补全</span>
          </div>
        </div>
      </div>
    </div>
  )
}
