import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import EmpireBox from './EmpireBox';

const sampleEquity = Array.from({ length: 60 }).map((_, i) => {
  const base = 100000 + i * 600 + Math.sin(i / 3) * 2000;
  return {
    t: i,
    equity: base + (Math.random() - 0.5) * 1500,
  };
});

const computeDrawdown = (series) => {
  let peak = -Infinity;
  return series.map((p) => {
    if (p.equity > peak) peak = p.equity;
    const dd = peak > 0 ? ((p.equity - peak) / peak) * 100 : 0;
    return { ...p, dd };
  });
};

const DrawdownChartSquare = () => {
  const data = useMemo(() => computeDrawdown(sampleEquity), []);

  const maxDD = data.reduce((min, p) => Math.min(min, p.dd), 0);

  return (
    <EmpireBox title="Drawdown Chart" theme="void" height="h-full">
      <div className="flex flex-col h-full gap-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
          <span>Simulated equity drawdown over time</span>
          <span>
            Max DD:{' '}
            <span className="text-rose-300 font-bold">
              {maxDD.toFixed(2)}%
            </span>
          </span>
        </div>

        <div className="flex-1 min-h-0 -ml-2">
          <ResponsiveContainer width="105%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.7)" />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.7)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.7)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => `${v.toFixed(2)}%`}
                labelFormatter={(label) => `Point ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(148,163,184,0.5)',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="dd"
                stroke="#f97373"
                strokeWidth={2}
                fill="rgba(248,113,113,0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[10px] text-white/40 font-mono">
          Negative values show distance from peak equity. Wire this square to live backtest or account equity curves to see real drawdowns.
        </div>
      </div>
    </EmpireBox>
  );
};

export default DrawdownChartSquare;

