import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function RealTimePnL({ theme = 'emerald' }) {
  const [equity, setEquity] = useState(null);
  const [pnl24h, setPnl24h] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      try {
        ws = new WebSocket('wss://coinbot-empire-2025.uc.r.app/api/ws/pnl');
      } catch (e) {
        console.error('RealTimePnL WebSocket init error:', e);
        setStatus('ERROR');
        return;
      }

      ws.onopen = () => {
        setStatus('LIVE');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (typeof msg.equity === 'number') {
            setEquity(msg.equity);
            setHistory((prev) => {
              const nextPoint = {
                t: new Date().toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                v: msg.equity,
              };
              const trimmed = [...prev, nextPoint];
              if (trimmed.length > 60) trimmed.shift();
              return trimmed;
            });
          }
          if (typeof msg.pnl24h === 'number') {
            setPnl24h(msg.pnl24h);
          }
        } catch (e) {
          console.error('RealTimePnL message parse error:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('RealTimePnL WebSocket error:', event);
        setStatus('ERROR');
      };

      ws.onclose = () => {
        setStatus('OFFLINE');
        reconnectTimer = window.setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, []);

  const isCyber = theme === 'cyber' || theme === 'pink';
  const color = isCyber ? '#c084fc' : '#34d399';

  const displayEquity =
    equity != null ? equity.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';
  const displayPnl =
    pnl24h != null ? pnl24h.toLocaleString(undefined, { maximumFractionDigits: 2 }) : null;
  const pnlPositive = (pnl24h || 0) >= 0;

  const chartData =
    history.length > 0
      ? history
      : [
          { t: '00:00', v: 0 },
          { t: '01:00', v: 0 },
        ];

  return (
    <div className="w-full h-full p-6 rounded-3xl empire-glass flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-2 z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
            Total Equity
          </h2>
          <div className="text-4xl font-bold mt-1 text-white">
            {displayEquity !== '—' ? (
              <>
                {displayEquity.split('.')[0]}
                {displayEquity.includes('.') && (
                  <span className="text-xl text-white/60">
                    .{displayEquity.split('.')[1]}
                  </span>
                )}
              </>
            ) : (
              '—'
            )}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Status: {status}</div>
        </div>
        {displayPnl !== null && (
          <div
            className={`px-2 py-1 rounded text-xs font-bold border ${
              pnlPositive
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {pnlPositive ? '+' : ''}
            {displayPnl} / 24h
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full -ml-2">
        <ResponsiveContainer width="105%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPnL)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
