import { useEffect, useRef, useMemo } from 'react'
import {
  createChart, ColorType, CrosshairMode,
  CandlestickSeries, HistogramSeries, LineSeries,
} from 'lightweight-charts'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface CandleChartProps {
  data: CandleData[]
  showSignals?: boolean
  isLoading: boolean
  error?: string | null
}

interface Signal {
  time: string
  position: 'aboveBar' | 'belowBar'
  color: string
  shape: 'arrowUp' | 'arrowDown'
  text: string
}

export function CandleChart({ data, showSignals = true, isLoading, error }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  // Compute MA values and signals client-side
  const { ma7, ma25, signals } = useMemo(() => {
    if (data.length < 26) return { ma7: [], ma25: [], signals: [] as Signal[] }

    const ma7Data: { time: string; value: number }[] = []
    const ma25Data: { time: string; value: number }[] = []
    const signalList: Signal[] = []

    let prevMA7Above: boolean | null = null

    for (let i = 24; i < data.length; i++) {
      // MA7
      let sum7 = 0
      for (let j = i - 6; j <= i; j++) sum7 += data[j].close
      const v7 = sum7 / 7
      ma7Data.push({ time: data[i].time, value: v7 })

      // MA25
      let sum25 = 0
      for (let j = i - 24; j <= i; j++) sum25 += data[j].close
      const v25 = sum25 / 25
      ma25Data.push({ time: data[i].time, value: v25 })

      // Detect crossover for signals
      if (i >= 25) {
        const ma7Above = v7 > v25
        if (prevMA7Above === false && ma7Above) {
          // MA7 crossed above MA25 → BUY signal
          signalList.push({
            time: data[i].time,
            position: 'belowBar',
            color: '#3fb950',
            shape: 'arrowUp',
            text: 'BUY',
          })
        } else if (prevMA7Above === true && !ma7Above) {
          // MA7 crossed below MA25 → SELL signal
          signalList.push({
            time: data[i].time,
            position: 'aboveBar',
            color: '#f85149',
            shape: 'arrowDown',
            text: 'SELL',
          })
        }
        prevMA7Above = ma7Above
      }
    }

    return { ma7: ma7Data, ma25: ma25Data, signals: signalList }
  }, [data])

  // Create chart on mount
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d1117' },
        textColor: '#8b949e',
        fontFamily: '"PingFang SC", "苹方", sans-serif',
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#8b949e', labelBackgroundColor: '#8b949e' },
        horzLine: { color: '#8b949e', labelBackgroundColor: '#8b949e' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#21262d',
      },
      rightPriceScale: { borderColor: '#21262d' },
      handleScroll: { vertTouchDrag: true },
    })

    // Candlestick
    chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderUpColor: '#3fb950', borderDownColor: '#f85149',
      wickUpColor: '#3fb950', wickDownColor: '#f85149',
    })

    // Volume (hidden by default)
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      visible: false,
    })

    // MA7 line
    chart.addSeries(LineSeries, {
      color: '#f97316', lineWidth: 2, lineStyle: 0,
      priceLineVisible: false, lastValueVisible: false,
    })

    // MA25 line
    chart.addSeries(LineSeries, {
      color: '#58a6ff', lineWidth: 2, lineStyle: 0,
      priceLineVisible: false, lastValueVisible: false,
    })

    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // Update all series data
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return
    const chart = chartRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSeries = (chart as any).series() as (ReturnType<typeof chart.addSeries> & { setData(data: unknown): void; setMarkers(markers: unknown[]): void })[]

    // Series order: 0=candle, 1=volume, 2=MA7, 3=MA25
    const candleData = data.map((d) => ({
      time: d.time, open: d.open, high: d.high, low: d.low, close: d.close,
    }))
    allSeries[0].setData(candleData)

    const volumeData = data
      .filter((d) => d.volume !== undefined)
      .map((d) => ({
        time: d.time, value: d.volume ?? 0,
        color: d.close >= d.open ? 'rgba(63, 185, 80, 0.35)' : 'rgba(248, 81, 73, 0.35)',
      }))
    allSeries[1].setData(volumeData)

    // MA lines
    if (ma7.length > 0) {
      allSeries[2].setData(ma7)
    }
    if (ma25.length > 0) {
      allSeries[3].setData(ma25)
    }

    // Signals on candlestick series
    if (showSignals && signals.length > 0) {
      allSeries[0].setMarkers(signals)
    } else {
      allSeries[0].setMarkers([])
    }

    chart.timeScale().fitContent()
  }, [data, ma7, ma25, signals, showSignals])

  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg" style={{ height: 520 }}>
        <div className="h-full animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-[#0d1117] rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg flex items-center justify-center" style={{ height: 520 }}>
        <p className="text-sm text-[#f85149]">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg flex items-center justify-center" style={{ height: 520 }}>
        <p className="text-sm text-[#8b949e]">选择交易对和时间框架查看 K 线</p>
      </div>
    )
  }

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden" style={{ height: 520 }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
