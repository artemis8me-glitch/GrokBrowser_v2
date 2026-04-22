import React from 'react';

/**
 * Codex Atom/Molecule
 * A simple RSI threshold slider that can be reused across organisms.
 * This is UI-only; wiring to live indicator data happens in Antigravity's passes.
 */
const RSIThresholdSlider = ({
  label = 'RSI Threshold',
  value = 30,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1 text-xs text-slate-200">
      <div className="flex justify-between items-center">
        <span className="uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <span className="font-mono text-emerald-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />
    </div>
  );
};

export default RSIThresholdSlider;

