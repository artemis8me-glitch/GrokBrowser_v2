import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmpireBox from './EmpireBox';
import { getApiUrl } from '../../config/api';

const PaperVsLivePnLSquare = () => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getApiUrl('/api/pnl/paper-vs-live'));
        if (!res.ok) throw new Error('Bad response');
        const payload = await res.json();
        setData(payload);
        setStatus('ONLINE');
      } catch (e) {
        console.error('PaperVsLivePnLSquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  const merged = React.useMemo(() => {
    if (!data) return [];
    const map = new Map();
    (data.paper_curve || []).forEach((p) => {
      map.set(p.ts, { ts: p.ts, paper: p.equity });
    });
    (data.live_curve || []).forEach((p) => {
      const existing = map.get(p.ts) || { ts: p.ts };
      existing.live = p.equity;
      map.set(p.ts, existing);
    });
    return Array.from(map.values()).sort((a, b) => (a.ts > b.ts ? 1 : -1));
  }, [data]);

  const spread = data?.spread_pct_now ?? null;

  return (
    <EmpireBox title="Paper vs Live PnL" theme="void" height="h-full">
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-white/40 font-mono">
              Equity curves
            </span>
            {spread != null && (
              <span className={`text-xs font-mono ${spread >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                Δ {spread.toFixed ? spread.toFixed(2) : spread}% {spread >= 0 ? 'live' : 'bleed'}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {status}
          </span>
        </div>

        <div className="flex-1 min-h-0 -ml-2">
          {merged.length > 0 ? (
            <ResponsiveContainer width="105%" height="100%">
              <LineChart data={merged}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis
                  dataKey="ts"
                  tickFormatter={() => ''}
                  tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(148,163,184,0.4)',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  labelFormatter={(value) =>
                    typeof value === 'number'
                      ? new Date(value * 1000).toLocaleString()
                      : value
                  }
                />
                <Line
                  type="monotone"
                  dataKey="paper"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  name="Paper"
                />
                <Line
                  type="monotone"
                  dataKey="live"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Live"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
              {status === 'OFFLINE' ? 'Backend offline' : 'Awaiting PnL history'}
            </div>
          )}
        </div>
      </div>
    </EmpireBox>
  );
};

export default PaperVsLivePnLSquare;

