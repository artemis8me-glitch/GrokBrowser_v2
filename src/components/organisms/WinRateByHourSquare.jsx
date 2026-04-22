import React, { useEffect, useState } from 'react';
import EmpireBox from './EmpireBox';
import { getApiUrl } from '../../config/api';

const WinRateByHourSquare = () => {
  const [buckets, setBuckets] = useState([]);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          getApiUrl('/api/stats/seasonality?window_days=30'),
        );
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        setBuckets(data.buckets || []);
        setStatus('ONLINE');
      } catch (e) {
        console.error('WinRateByHourSquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const best = [...buckets]
    .filter((b) => typeof b.win_rate_pct === 'number')
    .sort((a, b) => (b.win_rate_pct || 0) - (a.win_rate_pct || 0))
    .slice(0, 3);

  const worst = [...buckets]
    .filter((b) => typeof b.win_rate_pct === 'number')
    .sort((a, b) => (a.win_rate_pct || 0) - (b.win_rate_pct || 0))
    .slice(0, 3);

  const avg =
    buckets.length > 0
      ? buckets.reduce((sum, b) => sum + (b.win_rate_pct || 0), 0) /
        buckets.length
      : null;

  return (
    <EmpireBox title="Win Rate by Hour" theme="void" height="h-full">
      <div className="flex flex-col h-full gap-3 text-[11px] font-mono">
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-white/40">
            30‑day performance by UTC hour
          </div>
          <div className="text-[10px] text-white/40">Status: {status}</div>
        </div>

        {avg != null && (
          <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="text-[10px] text-white/50 uppercase tracking-[0.18em]">
              Overall Win Rate
            </div>
            <div className="text-emerald-300 text-lg font-bold">
              {avg.toFixed(1)}%
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
          <div className="flex flex-col">
            <div className="text-[10px] text-emerald-400 uppercase tracking-[0.18em] mb-1">
              Best Hours
            </div>
            <div className="flex-1 border border-emerald-500/30 rounded-lg bg-black/30 overflow-auto">
              {best.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[10px] text-white/30">
                  No data yet.
                </div>
              ) : (
                <ul className="divide-y divide-emerald-500/10">
                  {best.map((b) => (
                    <li
                      key={`best-${b.hour_utc}`}
                      className="px-3 py-1.5 flex justify-between items-center"
                    >
                      <span className="text-white">
                        {b.hour_utc.toString().padStart(2, '0')}:00–
                        {((b.hour_utc + 1) % 24).toString().padStart(2, '0')}
                        :00
                      </span>
                      <span className="text-emerald-300">
                        {b.win_rate_pct.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-[10px] text-rose-400 uppercase tracking-[0.18em] mb-1">
              Rough Hours
            </div>
            <div className="flex-1 border border-rose-500/30 rounded-lg bg-black/30 overflow-auto">
              {worst.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[10px] text-white/30">
                  No data yet.
                </div>
              ) : (
                <ul className="divide-y divide-rose-500/10">
                  {worst.map((b) => (
                    <li
                      key={`worst-${b.hour_utc}`}
                      className="px-3 py-1.5 flex justify-between items-center"
                    >
                      <span className="text-white">
                        {b.hour_utc.toString().padStart(2, '0')}:00–
                        {((b.hour_utc + 1) % 24).toString().padStart(2, '0')}
                        :00
                      </span>
                      <span className="text-rose-300">
                        {b.win_rate_pct.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmpireBox>
  );
};

export default WinRateByHourSquare;

