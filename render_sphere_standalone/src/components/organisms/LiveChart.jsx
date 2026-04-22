import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const LiveChart = () => {
    const chartContainerRef = useRef();
    const [symbol, setSymbol] = useState('BTC/USD');
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // Mock data generator
    const generateInitialData = () => {
        let data = [];
        let time = new Date(Date.now() - 1000 * 60 * 60 * 24).getTime() / 1000;
        let value = 98000;
        for (let i = 0; i < 1000; i++) {
            value = value + (Math.random() - 0.5) * 100;
            data.push({ time, value });
            time += 60;
        }
        return data;
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        let chart;
        let newSeries;

        try {
            chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: '#94a3b8',
                },
                width: chartContainerRef.current.clientWidth || 600,
                height: 300,
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
                },
                timeScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    timeVisible: true,
                },
                rightPriceScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                },
            });

            if (!chart) {
                console.error("Failed to initialize chart instance.");
                return;
            }

            try {
                newSeries = chart.addAreaSeries({
                    lineColor: '#3b82f6',
                    topColor: 'rgba(59, 130, 246, 0.4)',
                    bottomColor: 'rgba(59, 130, 246, 0.0)',
                });
                newSeries.setData(generateInitialData());
            } catch (seriesError) {
                console.error("Failed to add data series:", seriesError);
            }

        } catch (chartError) {
            console.error("Chart Crash:", chartError);
            return;
        }

        chartRef.current = chart;
        seriesRef.current = newSeries;

        window.addEventListener('resize', handleResize);

        // Real-time update simulation
        const interval = setInterval(() => {
            if (!seriesRef.current) return;
            // series.data() might be returning a Proxy or special object in some versions
            // For safety, we track data state or just append blindly based on time
            // To be ultra safe:
            try {
                const lastData = seriesRef.current.data();
                if (lastData && lastData.length > 0) {
                    const lastItem = lastData[lastData.length - 1];
                    if (lastItem) {
                        const newValue = lastItem.value + (Math.random() - 0.5) * 50;
                        const newTime = (lastItem.time) + 1;
                        seriesRef.current.update({ time: newTime, value: newValue });
                    }
                }
            } catch (e) {
                // ignore update errors
            }
        }, 1000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    return (
        <div className="p-6 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl shadow-2xl text-white w-full hover:border-blue-500/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-blue-400 tracking-wider">LIVE CHART</h3>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                    >
                        <option>BTC/USD</option>
                        <option>ETH/USD</option>
                        <option>SOL/USD</option>
                    </select>
                </div>
                <div className="text-[10px] font-mono text-gray-500 flex gap-2">
                    <span className="text-emerald-400 animate-pulse">● LIVE</span>
                    <span>1S INTERVAL</span>
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full h-[300px]" />
        </div>
    );
};

export default LiveChart;
