import React, { useEffect, useRef, useMemo } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

// ─── Sensex simulation seeded from market open ─────────────────────────────
function generateSensexData() {
    const data = []
    const now = new Date()
    const today = new Date(now)
    today.setHours(9, 15, 0, 0)

    let open = 73412 + (Math.random() - 0.5) * 800
    const totalMinutes = Math.min(
        Math.floor((now - today) / 60000),
        375
    )
    const minutesCount = Math.max(totalMinutes, 60)

    for (let i = 0; i < minutesCount; i += 5) {
        const time = new Date(today.getTime() + i * 60000)
        const timestamp = Math.floor(time.getTime() / 1000)
        const volatility = 120
        const close = open + (Math.random() - 0.5) * volatility
        const high = Math.max(open, close) + Math.random() * 80
        const low = Math.min(open, close) - Math.random() * 80
        data.push({ time: timestamp, open, high, low, close })
        open = close
    }
    return data
}

export default function SensexChart() {
    const chartContainerRef = useRef(null)
    const chartRef = useRef(null)
    const seriesRef = useRef(null)
    const candleData = useMemo(() => generateSensexData(), [])

    useEffect(() => {
        if (!chartContainerRef.current) return

        // lightweight-charts v5 API
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 380,
            layout: {
                background: { color: 'transparent' },
                textColor: 'rgba(255,255,255,0.45)',
                fontSize: 12,
                fontFamily: '"JetBrains Mono", monospace',
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.04)', style: 1 },
                horzLines: { color: 'rgba(255,255,255,0.04)', style: 1 },
            },
            crosshair: {
                mode: 1,
                vertLine: { width: 1, color: 'rgba(255,255,255,0.2)', style: 3 },
                horzLine: { width: 1, color: 'rgba(255,255,255,0.2)', style: 3 },
            },
            rightPriceScale: {
                borderColor: 'rgba(255,255,255,0.08)',
                textColor: 'rgba(255,255,255,0.35)',
            },
            timeScale: {
                borderColor: 'rgba(255,255,255,0.08)',
                textColor: 'rgba(255,255,255,0.35)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true },
        })

        // v5: addSeries(SeriesType, options)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#f43f5e',
            borderUpColor: '#10b981',
            borderDownColor: '#f43f5e',
            wickUpColor: 'rgba(16,185,129,0.6)',
            wickDownColor: 'rgba(244,63,94,0.6)',
        })

        candleSeries.setData(candleData)
        chart.timeScale().fitContent()

        chartRef.current = chart
        seriesRef.current = candleSeries

        // Live ticker — append a new candle every 3s
        const interval = setInterval(() => {
            const last = candleData[candleData.length - 1]
            const newClose = last.close + (Math.random() - 0.5) * 60
            const newCandle = {
                time: last.time + 300,
                open: last.close,
                high: Math.max(last.close, newClose) + Math.random() * 30,
                low: Math.min(last.close, newClose) - Math.random() * 30,
                close: newClose,
            }
            candleData.push(newCandle)
            seriesRef.current?.update(newCandle)
        }, 3000)

        const observer = new ResizeObserver(() => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth })
            }
        })
        if (chartContainerRef.current) observer.observe(chartContainerRef.current)

        return () => {
            clearInterval(interval)
            observer.disconnect()
            chart.remove()
        }
    }, [])

    return <div ref={chartContainerRef} style={{ width: '100%' }} />
}
