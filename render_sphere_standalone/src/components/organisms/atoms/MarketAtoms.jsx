import React, { useState } from 'react';

// --- ATOMS (Basic UI Elements) ---

export const AtomLabel = ({ children }) => (
    <label className="block text-[10px] uppercase tracking-wider mb-1 opacity-70 font-mono">{children}</label>
);

export const AtomInput = ({ value, onChange, type = "number", className = "" }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm focus:border-current outline-none transition-colors ${className}`}
    />
);

export const AtomSlider = ({ value, min, max, step, onChange, className = "" }) => (
    <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 accent-current ${className}`}
    />
);

export const AtomToggle = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!checked)}>
        <span className="text-xs group-hover:text-white transition-colors">{label}</span>
        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${checked ? 'bg-current' : 'bg-white/10'}`}>
            <div className={`w-3 h-3 rounded-full bg-black shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
    </div>
);

// --- MOLECULES (Specific Indicator Configurations) ---

export const RsiConfig = ({ period = 14, overbought = 70, oversold = 30 }) => (
    <div className="space-y-3">
        <div>
            <AtomLabel>RSI Period</AtomLabel>
            <div className="flex items-center gap-2">
                <AtomSlider value={period} min={2} max={50} step={1} onChange={() => { }} className="text-emerald-500" />
                <span className="text-xs w-6 text-right font-mono">{period}</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <AtomLabel>Overbought</AtomLabel>
                <AtomInput value={overbought} onChange={() => { }} />
            </div>
            <div>
                <AtomLabel>Oversold</AtomLabel>
                <AtomInput value={oversold} onChange={() => { }} />
            </div>
        </div>
    </div>
);

export const MacdConfig = ({ fast = 12, slow = 26, signal = 9 }) => (
    <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
            <div>
                <AtomLabel>Fast</AtomLabel>
                <AtomInput value={fast} onChange={() => { }} />
            </div>
            <div>
                <AtomLabel>Slow</AtomLabel>
                <AtomInput value={slow} onChange={() => { }} />
            </div>
            <div>
                <AtomLabel>Signal</AtomLabel>
                <AtomInput value={signal} onChange={() => { }} />
            </div>
        </div>
    </div>
);

export const BollingerConfig = ({ period = 20, stdDev = 2 }) => (
    <div className="space-y-2">
        <div>
            <AtomLabel>Period (SMA)</AtomLabel>
            <AtomSlider value={period} min={5} max={50} onChange={() => { }} className="text-cyan-500" />
        </div>
        <div>
            <AtomLabel>Std Deviation</AtomLabel>
            <AtomSlider value={stdDev} min={1} max={4} step={0.1} onChange={() => { }} className="text-cyan-500" />
        </div>
    </div>
);

export const StochasticConfig = ({ k = 14, d = 3, smooth = 3 }) => (
    <div className="grid grid-cols-3 gap-2">
        <div><AtomLabel>%K</AtomLabel><AtomInput value={k} onChange={() => { }} /></div>
        <div><AtomLabel>%D</AtomLabel><AtomInput value={d} onChange={() => { }} /></div>
        <div><AtomLabel>Smooth</AtomLabel><AtomInput value={smooth} onChange={() => { }} /></div>
    </div>
);

export const EmaConfig = ({ period = 50, source = "close" }) => (
    <div className="space-y-2">
        <AtomLabel>EMA Period</AtomLabel>
        <div className="flex gap-2">
            <AtomInput value={period} className="w-20" onChange={() => { }} />
            <select className="bg-black/30 border border-white/10 text-xs rounded px-2 text-white/70">
                <option>Close</option>
                <option>Open</option>
                <option>High</option>
                <option>Low</option>
            </select>
        </div>
    </div>
);
