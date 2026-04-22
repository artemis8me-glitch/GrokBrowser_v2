import React from 'react';

const segments = [
  { label: 'BTC', pct: 45, color: 'from-sky-500 to-cyan-400' },
  { label: 'ETH', pct: 30, color: 'from-violet-500 to-fuchsia-400' },
  { label: 'SOL', pct: 15, color: 'from-emerald-500 to-lime-400' },
  { label: 'USDT', pct: 10, color: 'from-slate-500 to-slate-300' },
];

const BacktestAllocation = () => {
  return (
    <div className="w-full h-full empire-glass rounded-3xl border border-white/10 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-extrabold tracking-[0.25em] text-sky-400 uppercase">
          Asset Allocation
        </h2>
        <span className="text-[10px] text-white/40 font-mono">End of Period</span>
      </div>
      <div className="grid grid-cols-4 gap-3 flex-1">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${seg.color} text-black font-mono shadow-[0_0_24px_rgba(15,23,42,0.8)]`}
          >
            <span className="text-xs font-bold">{seg.label}</span>
            <span className="text-sm">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BacktestAllocation;

