import React, { useState } from 'react';
import EmpireBox from './EmpireBox';

const strategies = [
  { id: 'scalp', name: 'Scalp v3', regime: 'Choppy', description: 'Fast entries on micro swings.' },
  { id: 'grid', name: 'Grid Walker', regime: 'Ranging', description: 'Place layered limit orders around mid.' },
  { id: 'trend', name: 'Trend Rider', regime: 'Trending', description: 'Ride breakouts with trailing stops.' },
  { id: 'mean', name: 'Mean Revert', regime: 'Mean Reversion', description: 'Fade extremes back to VWAP.' },
];

const StrategySwitcherSquare = () => {
  const [activeId, setActiveId] = useState('scalp');
  const [pendingId, setPendingId] = useState(null);

  const active = strategies.find((s) => s.id === activeId) || strategies[0];

  const handleSelect = (id) => {
    if (id === activeId) return;
    setPendingId(id);
    setTimeout(() => {
      setActiveId(id);
      setPendingId(null);
    }, 400);
  };

  return (
    <EmpireBox title="Strategy Switcher" theme="void" height="h-full">
      <div className="flex flex-col h-full gap-3 text-[11px] font-mono">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Active Strategy
          </div>
          <div className="px-2 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px]">
            {pendingId ? 'Switching…' : 'Live'}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg bg-black/40 p-3">
          <div className="text-xs text-white font-bold mb-1">
            {active.name}
          </div>
          <div className="text-[10px] text-sky-300 mb-1">
            Regime: {active.regime}
          </div>
          <div className="text-[10px] text-white/50 mb-2">
            {active.description}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-white/40">
            <div className="bg-black/40 border border-white/10 rounded px-2 py-1">
              <div className="uppercase tracking-[0.16em] text-[9px] mb-0.5">
                Risk
              </div>
              <div className="text-emerald-300">Medium</div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded px-2 py-1">
              <div className="uppercase tracking-[0.16em] text-[9px] mb-0.5">
                Timeframe
              </div>
              <div className="text-emerald-300">1–15m</div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded px-2 py-1">
              <div className="uppercase tracking-[0.16em] text-[9px] mb-0.5">
                Bots
              </div>
              <div className="text-emerald-300">8 linked</div>
            </div>
          </div>
        </div>

        <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
          Preset Loadouts
        </div>

        <div className="flex-1 min-h-0 overflow-auto border border-white/10 rounded-lg bg-black/30">
          {strategies.map((s) => {
            const isActive = s.id === activeId;
            const isPending = s.id === pendingId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.id)}
                className={`w-full text-left px-3 py-2 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors ${
                  isActive ? 'bg-emerald-500/10' : ''
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {s.name}
                  </div>
                  <div className="text-[9px] text-white/40">{s.regime}</div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  {isActive && !isPending && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Active
                    </span>
                  )}
                  {isPending && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse">
                      Pending
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </EmpireBox>
  );
};

export default StrategySwitcherSquare;

