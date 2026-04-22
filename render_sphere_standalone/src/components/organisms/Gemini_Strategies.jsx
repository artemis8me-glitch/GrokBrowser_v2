import React, { useState } from 'react';
import EmpireBox from './EmpireBox';
import * as Atoms from './atoms/MarketAtoms';

export const StrategyParametersBox = () => {
    return (
        <EmpireBox title="Strategy Matrix" description="Configure core indicator settings (RSI, MACD) and trend filters." theme="emerald" height="h-auto">
            <div className="space-y-6">
                <div className="border-b border-white/5 pb-4">
                    <Atoms.AtomLabel>Core Indicators</Atoms.AtomLabel>
                    <div className="space-y-4 mt-2">
                        <Atoms.RsiConfig />
                        <Atoms.MacdConfig />
                    </div>
                </div>
                <div>
                    <Atoms.AtomLabel>Trend Filter</Atoms.AtomLabel>
                    <div className="mt-2 text-emerald-500">
                        <Atoms.EmaConfig period={200} />
                    </div>
                </div>
            </div>
        </EmpireBox>
    );
};

export const RiskManagementBox = () => {
    const [stopLoss, setStopLoss] = useState(1.5);
    const [takeProfit, setTakeProfit] = useState(3.0);
    const [leverage, setLeverage] = useState(5);

    return (
        <EmpireBox title="Risk Protocol" description="Manage stop-loss, take-profit, and leverage settings for active bots." theme="ruby" height="h-auto">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between">
                        <Atoms.AtomLabel>Stop Loss %</Atoms.AtomLabel>
                        <span className="text-rose-400 font-mono text-xs">{stopLoss}%</span>
                    </div>
                    <Atoms.AtomSlider value={stopLoss} min={0.1} max={5} step={0.1} onChange={(e) => setStopLoss(e.target.value)} className="text-rose-500" />
                </div>

                <div>
                    <div className="flex justify-between">
                        <Atoms.AtomLabel>Take Profit %</Atoms.AtomLabel>
                        <span className="text-emerald-400 font-mono text-xs">{takeProfit}%</span>
                    </div>
                    <Atoms.AtomSlider value={takeProfit} min={0.5} max={10} step={0.1} onChange={(e) => setTakeProfit(e.target.value)} className="text-emerald-500" />
                </div>

                <div className="pt-2 border-t border-white/5">
                    <Atoms.AtomLabel>Leverage (x)</Atoms.AtomLabel>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                        {[1, 2, 5, 10, 20].map(lev => (
                            <button
                                key={lev}
                                onClick={() => setLeverage(lev)}
                                className={`text-xs py-1 rounded border ${leverage === lev ? 'bg-rose-500/20 border-rose-500 text-rose-100' : 'bg-transparent border-white/10 opacity-50 hover:opacity-100'}`}
                            >
                                {lev}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </EmpireBox>
    );
};

export const BotControlBox = () => {
    const [active, setActive] = useState(false);
    const [mode, setMode] = useState('paper');

    return (
        <EmpireBox title="Legion Control" description="Master switch to initialize or terminate the bot swarm. Toggles betwen Paper and Live modes." theme={active ? (mode === 'live' ? 'ruby' : 'emerald') : 'void'} height="h-48">
            <div className="flex flex-col h-full justify-between pb-2">
                <div className="flex gap-2 p-1 bg-black/40 rounded-lg">
                    {['paper', 'live'].map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-1 text-xs uppercase tracking-wider rounded ${mode === m ? 'bg-white/10 text-white' : 'text-white/30'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <div className="text-center space-y-2">
                    <div className={`text-4xl font-black tracking-tighter ${active ? (mode === 'live' ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-600'}`}>
                        {active ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    <div className="text-[10px] text-white/30 font-mono">
                        UPTIME: {active ? '04:22:19' : '00:00:00'}
                    </div>
                </div>

                <button
                    onClick={() => setActive(!active)}
                    className={`w-full py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${active
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30'
                        }`}
                >
                    {active ? 'Terminate Sequence' : 'Initialize Swarm'}
                </button>
            </div>
        </EmpireBox>
    );
};
