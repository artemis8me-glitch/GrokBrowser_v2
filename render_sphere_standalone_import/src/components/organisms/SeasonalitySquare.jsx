import React, { useEffect, useState } from 'react';
import EmpireBox from './EmpireBox';
import { getApiUrl } from '../../config/api';

const SeasonalitySquare = () => {
  const [buckets, setBuckets] = useState([]);
  const [currentHour, setCurrentHour] = useState(null);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getApiUrl('/api/stats/seasonality?window_days=90'));
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        setBuckets(data.buckets || []);
        setCurrentHour(typeof data.current_hour_utc === 'number' ? data.current_hour_utc : null);
        setStatus('ONLINE');
      } catch (e) {
        console.error('SeasonalitySquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  const maxWin = buckets.reduce((max, b) => Math.max(max, b.win_rate_pct || 0), 0) || 1;

  return (
    <EmpireBox title="Seasonality Clock" theme="cyan" height="h-full">
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono text-white/40">
            Win rate by hour (UTC)
          </div>
          <div className="text-[10px] text-white/40 font-mono">
            {status}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end gap-[3px] h-28">
            {Array.from({ length: 24 }).map((_, hour) => {
              const b = buckets.find((x) => x.hour_utc === hour) || {};
              const win = b.win_rate_pct ?? 0;
              const height = Math.max(4, (win / maxWin) * 100);
              const isCurrent = currentHour === hour;
              const baseColor = win >= 60 ? 'bg-emerald-400' : win >= 40 ? 'bg-amber-300' : 'bg-slate-500';
              const barClass = isCurrent
                ? 'bg-gradient-to-t from-amber-400 via-yellow-300 to-white shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                : baseColor;

              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-full ${barClass} transition-all duration-500`}
                    style={{ height: `${height}%` }}
                    title={`${hour}:00 — ${win.toFixed ? win.toFixed(1) : win}% (${b.trade_count || 0} trades)`}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[9px] text-white/30 font-mono">
            <span>0</span>
            <span>6</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>
      </div>
    </EmpireBox>
  );
};

export default SeasonalitySquare;

