import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-[#d2991d] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-2">页面加载异常</h2>
            <p className="text-sm text-[#8b949e] mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3 mb-4 text-left max-h-32 overflow-y-auto">
              <pre className="text-xs text-[#8b949e] font-mono whitespace-pre-wrap">
                {this.state.error?.stack?.split('\n').slice(0, 6).join('\n')}
              </pre>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-md text-sm font-medium bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
