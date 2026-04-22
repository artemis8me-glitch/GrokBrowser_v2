import React, { useState } from 'react';
import EmpireBox from './EmpireBox';
import { getApiUrl } from '../../config/api';

const KillSwitchSquare = () => {
  const [status, setStatus] = useState('ARMED');
  const [result, setResult] = useState(null);

  const triggerKill = async () => {
    if (!window.confirm('Confirm EMERGENCY FLATTEN ALL? This cannot be undone.')) {
      return;
    }
    setStatus('EXECUTING');
    setResult(null);

    try {
      const res = await fetch(getApiUrl('/api/emergency/flatten-all'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'empire_grid' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStatus('COMPLETE');
    } catch (e) {
      console.error('KillSwitchSquare error:', e);
      setStatus('ERROR');
    }
  };

  const theme =
    status === 'EXECUTING' || status === 'ARMED'
      ? 'ruby'
      : status === 'COMPLETE'
      ? 'emerald'
      : 'void';

  return (
    <EmpireBox title="Kill Switch" theme={theme} height="h-full">
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] text-white/60 font-mono">
            Emergency flatten of all positions, cancel all orders, disable bots.
          </div>
          <div className="text-[10px] text-white/40 font-mono">
            Status: <span className="font-semibold">{status}</span>
          </div>
        </div>

        <button
          onClick={triggerKill}
          disabled={status === 'EXECUTING'}
          className={`w-full py-4 rounded-xl text-sm font-black tracking-[0.3em] uppercase border transition-all duration-300 ${
            status === 'EXECUTING'
              ? 'bg-red-900 border-red-500 text-red-200 animate-pulse'
              : 'bg-red-600 hover:bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(248,113,113,0.7)]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Emergency Flatten All
        </button>

        <div className="min-h-[40px] text-[10px] text-white/40 font-mono overflow-auto">
          {result && (
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {!result && (
            <div className="opacity-60">
              Use only when the swarm is in danger. Requires backend protection and auth.
            </div>
          )}
        </div>
      </div>
    </EmpireBox>
  );
};

export default KillSwitchSquare;

