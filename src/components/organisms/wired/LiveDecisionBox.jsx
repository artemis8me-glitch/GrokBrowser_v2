import React, { useState, useEffect } from 'react';
import EmpireBox from '../EmpireBox';

// --- MOCK API HOOK (Simulating connection to decision_engine.py) ---
// In production, this connects to the WebSocket stream
const useDecisionStream = () => {
    const [decision, setDecision] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulating data stream from decision_engine.py
            const signals = ['LONG', 'SHORT', 'HOLD'];
            const reasons = ['RSI Divergence', 'MACD Crossover', 'Volume Spike', 'Zone Rejection'];

            setDecision({
                type: signals[Math.floor(Math.random() * signals.length)],
                confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
                reason: reasons[Math.floor(Math.random() * reasons.length)],
                timestamp: new Date().toISOString(),
                meta: {
                    symbol: 'BTC-USD',
                    price: 96000 + Math.random() * 500
                }
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return decision;
};

// --- WIRED COMPONENT ---

export const LiveDecisionBox = () => {
    const data = useDecisionStream();

    if (!data) return (
        <EmpireBox title="Decision Engine" theme="void" height="h-40">
            <div className="flex items-center justify-center h-full text-xs text-slate-500 animate-pulse">
                AWAITING SIGNAL...
            </div>
        </EmpireBox>
    );

    const theme = data.type === 'LONG' ? 'emerald' : (data.type === 'SHORT' ? 'ruby' : 'void');
    const glowCheck = data.type === 'LONG' ? 'shadow-emerald-500/50' : (data.type === 'SHORT' ? 'shadow-rose-500/50' : '');

    return (
        <EmpireBox title="Swarm Consensus" description="Real-time AI trade signal generator. Monitors market conditions to issue BUY/SELL/HOLD commands." theme={theme} height="h-auto">
            <div className="flex flex-col gap-4">

                {/* Main Signal Display */}
                <div className={`relative flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 overflow-hidden ${glowCheck} shadow-lg transition-shadow duration-500`}>
                    <div className="z-10">
                        <div className="text-[10px] uppercase text-white/50 tracking-widest mb-1">Action</div>
                        <div className="text-3xl font-black tracking-tighter">{data.type}</div>
                    </div>
                    <div className="z-10 text-right">
                        <div className="text-[10px] uppercase text-white/50 tracking-widest mb-1">Confidence</div>
                        <div className="text-2xl font-bold font-mono">{data.confidence}%</div>
                    </div>

                    {/* Background Pulse Effect */}
                    <div className={`absolute inset-0 opacity-10 ${theme === 'emerald' ? 'bg-emerald-500' : (theme === 'ruby' ? 'bg-rose-500' : 'bg-slate-500')}`} />
                </div>

                {/* Logic Trace */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase text-white/40 font-mono">
                        <span>Reasoning</span>
                        <span>{data.timestamp.split('T')[1].split('.')[0]}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-white/5 text-xs text-white/80 font-mono">
                        {`>> DETECTED ${data.reason.toUpperCase()}`}
                        <br />
                        {`>> EXECUTING LOGIC CHAIN A-7`}
                        <br />
                        {`>> TARGET: ${data.meta.symbol} @ ${data.meta.price.toFixed(2)}`}
                    </div>
                </div>

            </div>
        </EmpireBox>
    );
};
