import React from 'react';

const metric = (label, value, accent, sub) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
      {label}
    </span>
    <span className={`text-xl font-extrabold font-mono ${accent}`}>{value}</span>
    {sub && <span className="text-[11px] text-white/40">{sub}</span>}
  </div>
);

const BacktestKeyMetrics = () => {
  return (
    <div className="w-full h-full empire-glass rounded-3xl border border-white/10 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-extrabold tracking-[0.25em] text-sky-400 uppercase">
          Key Metrics
        </h2>
        <span className="text-[10px] text-white/40 font-mono">SIM SNAPSHOT</span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {metric('Success Rate', '72.5%', 'text-emerald-400', '↑ vs baseline')}
        {metric('Total Trades', '1,240', 'text-cyan-400')}
        {metric('Avg Profit / Trade', '$36.45', 'text-emerald-300')}
        {metric('Max Drawdown', '-12.1%', 'text-rose-400')}
        {metric('Sharpe Ratio', '2.1', 'text-emerald-300')}
        {metric('Avg Latency', '45ms', 'text-cyan-300')}
        {metric('Win / Loss Ratio', '2.64', 'text-emerald-300')}
      </div>
    </div>
  );
};

export default BacktestKeyMetrics;

