import { useState, useEffect } from 'react'

const INITIAL_DATA = {
    sensex: { name: 'SENSEX', value: 72412.35, change: 412.10, percent: 0.57 },
    nifty: { name: 'NIFTY 50', value: 22011.95, change: 124.30, percent: 0.56 },
    stocks: [
        { symbol: 'RELIANCE', price: 2942.10, change: 24.50, percent: 0.84 },
        { symbol: 'TCS', price: 4122.45, change: -12.30, percent: -0.30 },
        { symbol: 'HDFCBANK', price: 1452.10, change: 5.40, percent: 0.37 },
        { symbol: 'INFY', price: 1622.30, change: 18.20, percent: 1.13 },
        { symbol: 'ZOMATO', price: 162.45, change: 4.20, percent: 2.65 },
    ]
}

export function useMarketData() {
    const [data, setData] = useState(INITIAL_DATA)

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const fluctuate = (val) => val + (Math.random() - 0.5) * (val * 0.0005)

                return {
                    sensex: {
                        ...prev.sensex,
                        value: fluctuate(prev.sensex.value)
                    },
                    nifty: {
                        ...prev.nifty,
                        value: fluctuate(prev.nifty.value)
                    },
                    stocks: prev.stocks.map(s => ({
                        ...s,
                        price: fluctuate(s.price),
                        change: s.change + (Math.random() - 0.5) * 1.5
                    }))
                }
            })
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return data
}
