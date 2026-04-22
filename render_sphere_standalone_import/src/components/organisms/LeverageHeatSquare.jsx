import React, { useEffect, useState } from 'react';
import EmpireBox from './EmpireBox';

const normalizePositions = (raw, nowTs) => {
  const base = Array.isArray(raw) ? raw : raw?.positions || raw?.open_positions || [];
  return base.map((p, idx) => {
    const symbol = p.symbol || p.pair || p.market || p.asset || `BOT-${idx + 1}`;
    const side = p.side || p.direction || (p.size && p.size < 0 ? 'sell' : 'buy');
    const size =
      p.size ??
      p.amount ??
      p.position_size ??
      p.qty ??
      p.quantity ??
      null;
    const entry =
      p.entry_price ??
      p.avg_entry_price ??
      p.price ??
      null;
    const leverRaw =
      p.leverage ??
      p.leverage_x ??
      p.lever ??
      null;
    const leverage =
      typeof leverRaw === 'number'
        ? leverRaw
        : leverRaw != null
        ? parseFloat(leverRaw)
        : null;
    const liq =
      p.liquidation_price ??
      p.liq_price ??
      p.liquidation ??
      null;
    const lastHeartbeat =
      p.last_heartbeat_ts ??
      p.last_heartbeat ??
      p.heartbeat_ts ??
      null;

    let heartbeatLag = null;
    if (typeof lastHeartbeat === 'number') {
      heartbeatLag = nowTs - lastHeartbeat;
    } else if (typeof lastHeartbeat === 'string') {
      const parsed = Date.parse(lastHeartbeat);
      if (!Number.isNaN(parsed)) {
        heartbeatLag = nowTs - parsed / 1000;
      }
    }

    return {
      symbol,
      side: side ? side.toUpperCase() : '—',
      size,
      entry_price: entry,
      leverage,
      liq_price: liq,
      heartbeatLag,
    };
  });
};

const LeverageHeatSquare = () => {
  const [payload, setPayload] = useState({ positions: [], max_leverage: 0 });
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://coinbot-empire-2025.uc.r.app/api/positions');
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        const nowTs = Date.now() / 1000;
        const positions = normalizePositions(data, nowTs);
        const maxLev = positions.reduce(
          (max, p) =>
            typeof p.leverage === 'number'
              ? Math.max(max, p.leverage)
              : max,
          0
        );
        setPayload({ positions, max_leverage: maxLev });
        setStatus('ONLINE');
      } catch (e) {
        console.error('LeverageHeatSquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchData();
    const id = setInterval(fetchData, 7000);
    return () => clearInterval(id);
  }, []);

  const effectiveLev = payload?.max_leverage ?? 0;

  let theme = 'void';
  if (effectiveLev >= 15) theme = 'ruby';
  else if (effectiveLev >= 10) theme = 'ruby';
  else if (effectiveLev >= 5) theme = 'gold';
  else if (effectiveLev > 0) theme = 'emerald';

  const getBadge = () => {
    if (effectiveLev >= 15) return '☠ 15x+';
    if (effectiveLev >= 10) return 'DANGER 10x';
    if (effectiveLev >= 5) return 'HOT 5x';
    if (effectiveLev > 0) return 'LEANED IN';
    return 'FLAT';
  };

  return (
    <EmpireBox title="Leverage Heat" theme={theme} height="h-full">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Effective Leverage
            </div>
            <div className="text-3xl font-black tracking-tight">
              {effectiveLev.toFixed(2)}<span className="text-xs text-white/50">x</span>
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold border border-white/10 bg-white/5">
              {getBadge()}
            </span>
            <span className="mt-1 text-[10px] text-white/40 font-mono">
              {status}
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 shadow-[0_0_20px_rgba(248,113,113,0.4)] transition-all duration-700"
            style={{
              width: `${Math.max(0, Math.min(100, (effectiveLev / 20) * 100))}%`,
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto mt-2">
          {payload?.positions && payload.positions.length > 0 ? (
            <div className="space-y-2">
              {payload.positions.slice(0, 5).map((p) => (
                <div
                  key={p.symbol}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      {p.symbol}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {p.side} • {p.size ?? '?'} @ {p.entry_price ?? '?'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-amber-300">
                      {p.leverage != null
                        ? (p.leverage.toFixed?.(1) ?? p.leverage)
                        : '—'}
                      x
                    </div>
                    <div className="text-[10px] text-rose-300">
                      Liq: {p.liq_price ?? '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
              {status === 'OFFLINE' ? 'Backend offline' : 'No leveraged positions detected'}
            </div>
          )}
        </div>
      </div>
    </EmpireBox>
  );
};

export default LeverageHeatSquare;
