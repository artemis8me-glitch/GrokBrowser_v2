import React, { useEffect, useState } from 'react';
import EmpireBox from './EmpireBox';

const normalizeBots = (raw) => {
  const nowTs = Date.now() / 1000;
  const base = Array.isArray(raw) ? raw : raw?.bots || raw?.workers || raw?.units || [];
  return base.map((b, idx) => {
    const name = b.name || b.id || b.label || `Unit-${idx + 1}`;
    const pair = b.pair || b.symbol || b.market || '';
    const status = b.status || b.state || 'UNKNOWN';
    const uptimeSeconds =
      b.uptime_seconds ??
      b.uptime ??
      null;
    const uptimePct =
      b.uptime_pct ??
      b.uptime_percent ??
      null;
    const lastHeartbeat =
      b.last_heartbeat_ts ??
      b.last_heartbeat ??
      b.heartbeat_ts ??
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
      name,
      pair,
      status,
      uptimeSeconds,
      uptimePct,
      heartbeatLag,
    };
  });
};

const formatUptime = (seconds) => {
  if (seconds == null) return 'N/A';
  const total = Number(seconds) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (!hours && !minutes) return `${total.toFixed(0)}s`;
  if (!hours) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const BotUptimeSquare = () => {
  const [bots, setBots] = useState([]);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://coinbot-empire-2025.uc.r.app/api/swarm/status');
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        const normalized = normalizeBots(data);
        setBots(normalized);
        setStatus('ONLINE');
      } catch (e) {
        console.error('BotUptimeSquare error:', e);
        setStatus('OFFLINE');
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, []);

  const anyLate = bots.some((b) => b.heartbeatLag != null && b.heartbeatLag > 60);
  const total = bots.length;
  const healthy = bots.filter((b) => !b.heartbeatLag || b.heartbeatLag <= 60).length;

  const theme = anyLate ? 'ruby' : 'emerald';

  return (
    <EmpireBox title="Bot Uptime" theme={theme} height="h-full">
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-white/40 font-mono">
            Swarm health: {healthy}/{total} reporting
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10px] text-white/40 font-mono">{status}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto space-y-2">
          {bots.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
              {status === 'OFFLINE' ? 'Swarm endpoint unavailable' : 'No active units'}
            </div>
          )}

          {bots.slice(0, 8).map((bot, i) => {
            const lag = bot.heartbeatLag;
            const late = lag != null && lag > 60;
            return (
              <div
                key={bot.name + i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs ${
                  late
                    ? 'bg-rose-950/60 border-rose-500/40'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div>
                  <div className="font-bold text-white">
                    {bot.name}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    {bot.pair || '—'} • {bot.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-300 font-mono">
                    Uptime: {formatUptime(bot.uptimeSeconds)}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    {lag != null ? `Δ ${lag.toFixed(0)}s` : 'Δ n/a'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </EmpireBox>
  );
};

export default BotUptimeSquare;

