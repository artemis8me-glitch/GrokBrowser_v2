import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const BacktestPerformance = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth || 600,
      height: 260,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#e5f9ff',
      },
      rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.4)' },
      timeScale: { borderColor: 'rgba(148, 163, 184, 0.4)' },
      grid: {
        vertLines: { color: 'rgba(15,23,42,0.8)' },
        horzLines: { color: 'rgba(15,23,42,0.8)' },
      },
    });

    const series = chart.addAreaSeries({
      lineColor: '#38bdf8',
      topColor: 'rgba(56,189,248,0.4)',
      bottomColor: 'rgba(15,23,42,0.9)',
    });

    const now = Math.floor(Date.now() / 1000);
    const data = [];
    let base = 0;
    for (let i = 0; i < 120; i++) {
      base += Math.random() * 800 - 200;
      data.push({ time: now - (120 - i) * 86400, value: base });
    }
    series.setData(data);

    const handleResize = () => {
      if (!ref.current) return;
      chart.applyOptions({ width: ref.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="w-full h-full empire-glass rounded-3xl border border-white/10 p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-[0.25em] text-sky-400 uppercase">
            Historical Performance
          </h2>
          <p className="text-[11px] text-white/40 mt-1 font-mono">
            Cumulative PnL (USDT)
          </p>
        </div>
        <div className="text-right text-[11px] font-mono">
          <div className="text-emerald-400 font-bold">+45,200 USDT</div>
          <div className="text-white/40 text-[10px]">Jan 2023 → Jun 2023</div>
        </div>
      </div>
      <div ref={ref} className="flex-1 w-full" />
    </div>
  );
};

export default BacktestPerformance;

