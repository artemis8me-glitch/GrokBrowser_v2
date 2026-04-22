import React, { useState } from 'react';
import { Settings, Activity, Zap, Cpu } from 'lucide-react';

const SliderControl = ({ label, value, min, max, step, onChange, suffix = '' }) => (
  <div className="mb-4 group">
    <div className="flex justify-between mb-2">
      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider group-hover:text-cyan-400 transition-colors">
        {label}
      </label>
      <span className="text-xs text-white font-mono bg-slate-800 px-2 rounded border border-slate-700">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
    />
  </div>
);

const ToggleControl = ({ label, active, onChange }) => (
  <button
    type="button"
    className="flex items-center justify-between w-full p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-slate-700/50 mb-3 transition-colors cursor-pointer"
    onClick={() => onChange(!active)}
  >
    <span className="text-sm font-medium text-slate-200">{label}</span>
    <div
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        active ? 'bg-cyan-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </div>
  </button>
);

export default function StrategyParameters({ theme = 'emerald' }) {
  const [params, setParams] = useState({
    bbPeriod: 20,
    bbStdDev: 2.0,
    rsiPeriod: 14,
    aiEnabled: false,
  });

  const themeBorder =
    theme === 'cyber'
      ? 'border-purple-500/50 shadow-purple-900/20'
      : theme === 'dark'
        ? 'border-slate-800 shadow-black/40'
        : 'border-emerald-500/30 shadow-emerald-900/20';

  return (
    <div
      className={`p-5 flex flex-col h-full w-full empire-glass rounded-3xl border ${themeBorder}`}
    >
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Settings size={18} className="text-cyan-400" />
        <h2 className="font-bold text-white text-sm uppercase tracking-wide">Strategy Config</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={14} /> Bollinger Bands
          </h3>
          <SliderControl
            label="Period"
            value={params.bbPeriod}
            min={10}
            max={50}
            step={1}
            onChange={(v) => setParams((p) => ({ ...p, bbPeriod: v }))}
          />
          <SliderControl
            label="Std Deviation"
            value={params.bbStdDev}
            min={1}
            max={4}
            step={0.1}
            onChange={(v) => setParams((p) => ({ ...p, bbStdDev: v }))}
          />
        </div>

        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
            <Zap size={14} /> RSI Momentum
          </h3>
          <SliderControl
            label="RSI Period"
            value={params.rsiPeriod}
            min={2}
            max={30}
            step={1}
            onChange={(v) => setParams((p) => ({ ...p, rsiPeriod: v }))}
          />
        </div>

        <div
          className={`p-4 border rounded-xl transition-colors ${
            params.aiEnabled ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-800 bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu
                size={16}
                className={params.aiEnabled ? 'text-cyan-400' : 'text-slate-500'}
              />
              <span className="font-bold text-white text-sm">AI Signal Filter</span>
            </div>
          </div>
          <ToggleControl
            label="Enable Gemini Validation"
            active={params.aiEnabled}
            onChange={(v) => setParams((p) => ({ ...p, aiEnabled: v }))}
          />
          <p className="text-[10px] text-slate-400 mt-2">
            Uses Gemini-style validation to cross-check Mean Reversion signals and reduce false
            positives.
          </p>
        </div>
      </div>
    </div>
  );
}

